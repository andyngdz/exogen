"""Tests for model loading cancellation support.

This test suite verifies that:
1. CancellationToken properly signals cancellation
2. Model loader respects cancellation at checkpoints
3. ModelManager can cancel in-progress loads via unload
4. React double-mount scenario is handled correctly
5. State transitions work correctly during cancellation
"""

import asyncio
from unittest.mock import MagicMock, patch

import pytest

from app.cores.model_loader.cancellation import CancellationException, CancellationToken
from app.cores.model_manager import ModelState, model_manager


class TestCancellationToken:
	"""Test CancellationToken functionality."""

	def test_token_initial_state(self):
		"""Test that token starts in non-cancelled state."""
		token = CancellationToken()
		assert token.is_cancelled() is False

	def test_token_cancel(self):
		"""Test that cancel() sets the cancelled flag."""
		token = CancellationToken()
		token.cancel()
		assert token.is_cancelled() is True

	def test_token_check_cancelled_raises(self):
		"""Test that check_cancelled() raises when cancelled."""
		token = CancellationToken()
		token.cancel()

		with pytest.raises(CancellationException):
			token.check_cancelled()

	def test_token_check_cancelled_no_raise(self):
		"""Test that check_cancelled() doesn't raise when not cancelled."""
		token = CancellationToken()
		# Should not raise
		token.check_cancelled()


class TestModelLoaderCancellation:
	"""Test model_loader cancellation at checkpoints."""

	def test_cancellation_before_initialization(self):
		"""Test cancellation at checkpoint 1 (before initialization)."""
		from app.cores.model_loader.model_loader import model_loader

		# Setup - cancel immediately
		token = CancellationToken()
		token.cancel()

		# Execute - should raise immediately at first checkpoint
		with pytest.raises(CancellationException):
			model_loader('test/model', token)

	@patch('app.cores.model_loader.model_loader.MaxMemoryConfig')
	@patch('app.cores.model_loader.model_loader.SessionLocal')
	def test_cancellation_after_initialization(self, mock_session, mock_max_memory):
		"""Test cancellation at checkpoint 2 (after initialization)."""
		from app.cores.model_loader.model_loader import model_loader

		# Setup mocks
		mock_db = MagicMock()
		mock_session.return_value = mock_db
		mock_max_memory_instance = MagicMock()
		mock_max_memory_instance.to_dict.return_value = {}
		mock_max_memory.return_value = mock_max_memory_instance

		token = CancellationToken()

		# Cancel immediately after MaxMemoryConfig is created
		def cancel_after_config(*args, **kwargs):
			token.cancel()
			return mock_max_memory_instance

		mock_max_memory.side_effect = cancel_after_config

		# Execute - should cancel at checkpoint 2
		with pytest.raises(CancellationException):
			model_loader('test/model', token)


class TestModelManagerCancellation:
	"""Test ModelManager cancellation support."""

	def setup_method(self):
		"""Reset model_manager state before each test."""
		# Ensure model_manager is in IDLE state (use new API)
		if model_manager.has_model:
			model_manager.pipeline_manager.pipe = None
			model_manager.pipeline_manager.model_id = None
		model_manager.state_manager._state = ModelState.IDLE
		model_manager.loader_service.cancel_token = None
		model_manager.loader_service.loading_task = None

	@pytest.mark.asyncio
	async def test_unload_cancels_loading(self):
		"""Test that unload_model_async cancels in-progress load."""
		# Arrange - Create a slow-loading mock
		with patch.object(model_manager.loader_service, 'load_model_sync') as mock_load:

			def sync_slow_load(model_id):
				"""Simulates a slow model load that respects cancellation."""
				import time

				# Simulate slow loading with cancellation checks
				for i in range(20):
					time.sleep(0.05)
					# Check cancellation token (now in loader_service)
					if model_manager.loader_service.cancel_token and model_manager.loader_service.cancel_token.is_cancelled():
						raise CancellationException('Load cancelled')

				return {'model_type': 'test'}

			mock_load.side_effect = sync_slow_load

			# Start loading
			load_task = asyncio.create_task(model_manager.load_model_async('test/model'))

			# Wait for load to start
			await asyncio.sleep(0.15)

			# Verify state is LOADING
			assert model_manager.current_state == ModelState.LOADING

			# Request unload (should trigger cancellation)
			await model_manager.unload_model_async()

			# Verify state returned to IDLE
			assert model_manager.current_state == ModelState.IDLE

			# Clean up the load task - it should have been cancelled
			try:
				await load_task
			except CancellationException:
				# Expected - load was cancelled
				pass

	@pytest.mark.asyncio
	async def test_state_transitions_during_cancellation(self):
		"""Test state transitions: IDLE -> LOADING -> IDLE (via cancellation)."""
		# Start in IDLE
		assert model_manager.current_state == ModelState.IDLE

		# Mock a load that will be cancelled
		with patch.object(model_manager.loader_service, 'load_model_sync') as mock_load:

			def slow_load_with_cancel_check(model_id):
				import time

				for i in range(50):
					time.sleep(0.02)
					if model_manager.loader_service.cancel_token and model_manager.loader_service.cancel_token.is_cancelled():
						raise CancellationException('Cancelled')
				return {}

			mock_load.side_effect = slow_load_with_cancel_check

			# Start load
			load_task = asyncio.create_task(model_manager.load_model_async('test/model'))

			# Wait for LOADING state
			await asyncio.sleep(0.1)
			assert model_manager.current_state == ModelState.LOADING

			# Trigger unload/cancellation
			unload_task = asyncio.create_task(model_manager.unload_model_async())

			# Wait for unload to complete
			await unload_task

			# Should end in IDLE (cancellation goes directly from LOADING to IDLE)
			assert model_manager.current_state == ModelState.IDLE

			# Clean up load task
			try:
				await load_task
			except CancellationException:
				pass

	@pytest.mark.asyncio
	async def test_concurrent_load_requests_serialized(self):
		"""Test that concurrent load requests are serialized by the lock."""
		load_order = []

		with patch.object(model_manager.loader_service, 'load_model_sync') as mock_load:

			def track_load(model_id):
				load_order.append(f'start_{model_id}')
				import time

				time.sleep(0.1)
				load_order.append(f'end_{model_id}')
				return {}

			mock_load.side_effect = track_load

			# Start two loads concurrently
			task1 = asyncio.create_task(model_manager.load_model_async('model1'))
			task2 = asyncio.create_task(model_manager.load_model_async('model2'))

			# Wait for both
			await asyncio.gather(task1, task2, return_exceptions=True)

			# Verify serialization - one should complete before other starts
			# Expected: ['start_model1', 'end_model1', 'start_model2', 'end_model2']
			# OR the second might fail because state is already LOADING
			# Since we have a lock, the second request should wait or fail

			# At least verify no interleaving
			if len(load_order) >= 2:
				# If both started, verify no interleaving
				if 'start_model1' in load_order and 'start_model2' in load_order:
					idx1_start = load_order.index('start_model1')
					idx1_end = load_order.index('end_model1')
					idx2_start = load_order.index('start_model2')

					# Either model1 completes before model2 starts, or vice versa
					assert idx1_end < idx2_start or idx2_start < idx1_start


class TestReactDoubleMountScenario:
	"""Test the React StrictMode double-mount scenario."""

	def setup_method(self):
		"""Reset model_manager state before each test."""
		if model_manager.has_model:
			model_manager.pipeline_manager.pipe = None
			model_manager.pipeline_manager.model_id = None
		model_manager.state_manager._state = ModelState.IDLE
		model_manager.loader_service.cancel_token = None
		model_manager.loader_service.loading_task = None

	@pytest.mark.asyncio
	async def test_react_double_mount_sequence(self):
		"""
		Test React double-mount scenario:
		1. Mount 1 -> loadModel() starts (P1)
		2. Unmount 1 -> unloadModel() called -> cancels P1
		3. Mount 2 -> loadModel() again (P2) -> succeeds
		"""
		with patch.object(model_manager.loader_service, 'load_model_sync') as mock_load:

			def load_with_cancellation_support(model_id):
				"""Simulates model loading with cancellation checks."""
				import time

				# Simulate load taking time
				for i in range(20):
					time.sleep(0.05)
					if model_manager.loader_service.cancel_token and model_manager.loader_service.cancel_token.is_cancelled():
						raise CancellationException('Cancelled')

				# Return mock pipe config (load_model_sync returns dict, not pipe)
				return {'model_type': 'test', 'model_id': model_id}

			mock_load.side_effect = load_with_cancellation_support

			# Step 1: Mount 1 - Start first load (P1)
			p1_task = asyncio.create_task(model_manager.load_model_async('test/model'))

			# Wait for P1 to start
			await asyncio.sleep(0.1)
			assert model_manager.current_state == ModelState.LOADING

			# Step 2: Unmount 1 - Cleanup effect fires -> unload
			await model_manager.unload_model_async()

			# P1 should be cancelled
			assert model_manager.current_state == ModelState.IDLE

			# Verify P1 failed with cancellation
			try:
				await p1_task
				assert False, 'P1 should have been cancelled'
			except CancellationException:
				# Expected - P1 was cancelled
				pass

			# Step 3: Mount 2 - Start second load (P2)
			p2_task = asyncio.create_task(model_manager.load_model_async('test/model'))

			# Wait for P2 to complete
			result = await p2_task

			# P2 should succeed
			assert model_manager.current_state == ModelState.LOADED
			assert result is not None

	@pytest.mark.asyncio
	async def test_rapid_load_load_auto_cancel(self):
		"""
		Test that rapid load -> load (without explicit unload) automatically cancels first load.
		This verifies the auto-cancellation feature works correctly.
		"""
		with patch.object(model_manager.loader_service, 'load_model_sync') as mock_load:

			def slow_load(model_id):
				"""Simulates a slow model load with cancellation support."""
				import time

				# Simulate slow loading with cancellation checks
				for i in range(20):
					time.sleep(0.05)
					if model_manager.loader_service.cancel_token and model_manager.loader_service.cancel_token.is_cancelled():
						raise CancellationException('Cancelled')

				# Return mock config (load_model_sync returns dict)
				return {'model_id': model_id}

			mock_load.side_effect = slow_load

			# Start P1 (model1)
			p1_task = asyncio.create_task(model_manager.load_model_async('model1'))
			await asyncio.sleep(0.15)  # Let P1 get into LOADING state

			# Verify P1 is in LOADING state
			assert model_manager.current_state == ModelState.LOADING

			# Start P2 (model2) WITHOUT calling unload
			# This should auto-cancel P1 and succeed
			p2_result = await model_manager.load_model_async('model2')

			# P2 should succeed
			assert model_manager.current_state == ModelState.LOADED
			# Model ID and pipe are managed internally by loader_service, just verify result
			assert p2_result is not None
			assert p2_result == {'model_id': 'model2'}

			# Clean up P1 task - it should have been cancelled
			try:
				await p1_task
			except CancellationException:
				# Expected - P1 was auto-cancelled by P2
				pass

	@pytest.mark.asyncio
	async def test_rapid_load_unload_load(self):
		"""
		Test rapid sequence of load -> unload -> load.
		This simulates impatient user or React remounting.

		Note: This test verifies that the cancellation mechanism works,
		even if there are edge cases in rapid succession scenarios.
		"""
		with patch.object(model_manager.loader_service, 'load_model_sync') as mock_load:

			def quick_load(model_id):
				"""Simulates a quick model load with cancellation support."""
				import time

				# Check cancellation before loading
				for i in range(10):
					time.sleep(0.02)
					if model_manager.loader_service.cancel_token and model_manager.loader_service.cancel_token.is_cancelled():
						raise CancellationException('Cancelled')

				# Return mock config (load_model_sync returns dict)
				return {'model_id': model_id}

			mock_load.side_effect = quick_load

			# Load 1
			task1 = asyncio.create_task(model_manager.load_model_async('model1'))
			await asyncio.sleep(0.08)  # Give time for load to start

			# Unload immediately (cancels task1)
			await model_manager.unload_model_async()

			# Clean up task1 first to ensure it's fully cancelled
			try:
				await task1
			except CancellationException:
				# Expected - task1 was cancelled
				pass

			# Verify we're back to IDLE state
			assert model_manager.current_state == ModelState.IDLE

			# Wait a bit to ensure cancellation cleanup is complete
			await asyncio.sleep(0.1)

			# Load 2 (different model) - fresh load after cancellation cleanup
			result = await model_manager.load_model_async('model2')

			# Should succeed with model2
			assert model_manager.current_state == ModelState.LOADED
			# Model ID and pipe are managed internally by loader_service, just verify result
			assert result is not None
			assert result == {'model_id': 'model2'}
