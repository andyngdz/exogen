"""Comprehensive tests for LoaderService class.

This test suite covers:
1. load_model_async() - async loading with cancellation support
2. unload_model_async() - async unloading with state management
3. cancel_current_load() - cancellation handling
4. load_model_sync() - synchronous loading in executor
5. unload_model_sync() - synchronous unloading
6. execute_load_in_background() - background thread execution
7. Edge cases (concurrent loads, fast path, error handling)
"""

import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.cores.model_loader import CancellationException, DuplicateLoadRequestError
from app.cores.model_manager.loader_service import LoaderService
from app.cores.model_manager.pipeline_manager import PipelineManager
from app.cores.model_manager.resource_manager import ResourceManager
from app.cores.model_manager.state_manager import ModelState, StateManager, StateTransitionReason


class TestLoadModelAsync:
	"""Test load_model_async() method."""

	def setup_method(self):
		"""Create fresh LoaderService for each test."""
		self.state_manager = StateManager()
		self.resource_manager = ResourceManager()
		self.pipeline_manager = PipelineManager()
		self.loader_service = LoaderService(self.state_manager, self.resource_manager, self.pipeline_manager)

	@pytest.mark.asyncio
	async def test_load_model_async_fast_path_already_loaded(self):
		"""Test load_model_async returns cached config when model already loaded."""
		# Setup
		mock_pipe = MagicMock()
		mock_pipe.config = {'model_type': 'test', 'model_id': 'test/model'}

		self.pipeline_manager.set_pipeline(mock_pipe, 'test/model')
		self.state_manager.set_state(ModelState.LOADED, StateTransitionReason.LOAD_COMPLETED)

		# Execute
		result = await self.loader_service.load_model_async('test/model')

		# Verify
		assert result == {'model_type': 'test', 'model_id': 'test/model'}
		assert self.state_manager.current_state == ModelState.LOADED

	@pytest.mark.asyncio
	async def test_load_model_async_success(self):
		"""Test load_model_async successfully loads a new model."""
		# Setup
		mock_pipe = MagicMock()
		mock_pipe.config = {'model_type': 'test', 'model_id': 'new/model'}

		with patch.object(self.loader_service, 'execute_load_in_background', return_value=mock_pipe.config):
			# Execute
			result = await self.loader_service.load_model_async('new/model')

			# Verify
			assert result == {'model_type': 'test', 'model_id': 'new/model'}
			assert self.state_manager.current_state == ModelState.LOADED
			assert self.loader_service.cancel_token is None
			assert self.loader_service.loading_task is None

	@pytest.mark.asyncio
	async def test_load_model_async_transitions_to_loading_state(self):
		"""Test load_model_async transitions to LOADING state."""
		# Setup
		mock_config = {'model_id': 'test/model'}

		with patch.object(self.loader_service, 'execute_load_in_background', return_value=mock_config):
			# Execute
			load_task = asyncio.create_task(self.loader_service.load_model_async('test/model'))

			# Give task time to acquire lock and transition
			await asyncio.sleep(0.01)

			# Verify state transitioned to LOADING (or LOADED if load completed fast)
			assert self.state_manager.current_state in {ModelState.LOADING, ModelState.LOADED}

			# Wait for completion
			await load_task

	@pytest.mark.asyncio
	async def test_load_model_async_handles_cancellation(self):
		"""Test load_model_async handles CancellationException."""
		# Setup
		with patch.object(
			self.loader_service, 'execute_load_in_background', side_effect=CancellationException('Cancelled by user')
		):
			# Execute & Verify
			with pytest.raises(CancellationException):
				await self.loader_service.load_model_async('test/model')

			# Verify state transitioned to IDLE
			assert self.state_manager.current_state == ModelState.IDLE
			assert self.loader_service.cancel_token is None
			assert self.loader_service.loading_task is None

	@pytest.mark.asyncio
	async def test_load_model_async_handles_error(self):
		"""Test load_model_async handles generic errors."""
		# Setup
		with patch.object(self.loader_service, 'execute_load_in_background', side_effect=ValueError('Load failed')):
			# Execute & Verify
			with pytest.raises(ValueError, match='Load failed'):
				await self.loader_service.load_model_async('test/model')

			# Verify state transitioned to ERROR
			assert self.state_manager.current_state == ModelState.ERROR
			assert self.loader_service.cancel_token is None
			assert self.loader_service.loading_task is None

	@pytest.mark.asyncio
	async def test_load_model_async_raises_when_invalid_state(self):
		"""Test load_model_async raises ValueError when in invalid state."""
		# Setup - set state to UNLOADING (invalid for loading)
		self.state_manager._state = ModelState.UNLOADING

		# Execute & Verify
		with pytest.raises(ValueError, match='Cannot load model in state'):
			await self.loader_service.load_model_async('test/model')

	@pytest.mark.asyncio
	async def test_load_model_async_cancels_previous_load(self):
		"""Test load_model_async calls cancel_current_load when another load is in progress."""
		# Manually set state to LOADING to simulate in-progress load
		self.state_manager._state = ModelState.LOADING

		with patch.object(self.loader_service, 'cancel_current_load', new_callable=AsyncMock) as mock_cancel:
			# Make cancel reset state to IDLE
			async def reset_state():
				self.state_manager._state = ModelState.IDLE

			mock_cancel.side_effect = reset_state

			# Mock execute_load_in_background
			mock_config = {'model_id': 'model2'}
			with patch.object(self.loader_service, 'execute_load_in_background', return_value=mock_config):
				# Execute - start new load while LOADING
				await self.loader_service.load_model_async('model2')

				# Verify cancel was called
				mock_cancel.assert_called_once()

	@pytest.mark.asyncio
	async def test_load_model_async_raises_duplicate_error_when_same_model_loading(self):
		"""Test load_model_async raises DuplicateLoadRequestError when same model is already loading."""
		# Setup - set state to LOADING and set the same model_id
		self.state_manager._state = ModelState.LOADING
		self.pipeline_manager.model_id = 'test/model'

		# Execute & Verify
		with pytest.raises(DuplicateLoadRequestError, match='is already loading'):
			await self.loader_service.load_model_async('test/model')

		# State should remain LOADING
		assert self.state_manager.current_state == ModelState.LOADING


class TestUnloadModelAsync:
	"""Test unload_model_async() method."""

	def setup_method(self):
		"""Create fresh LoaderService for each test."""
		self.state_manager = StateManager()
		self.resource_manager = ResourceManager()
		self.pipeline_manager = PipelineManager()
		self.loader_service = LoaderService(self.state_manager, self.resource_manager, self.pipeline_manager)

	@pytest.mark.asyncio
	async def test_unload_model_async_when_idle(self, caplog):
		"""Test unload_model_async returns early when state is IDLE."""
		import logging

		caplog.set_level(logging.INFO)

		# Setup
		self.state_manager._state = ModelState.IDLE

		# Execute
		await self.loader_service.unload_model_async()

		# Verify
		assert 'No model loaded, nothing to unload' in caplog.text
		assert self.state_manager.current_state == ModelState.IDLE

	@pytest.mark.asyncio
	async def test_unload_model_async_when_loaded(self):
		"""Test unload_model_async successfully unloads model."""
		# Setup
		mock_pipe = MagicMock()
		self.pipeline_manager.set_pipeline(mock_pipe, 'test/model')
		self.state_manager.set_state(ModelState.LOADED, StateTransitionReason.LOAD_COMPLETED)

		with patch.object(self.loader_service, 'unload_model_sync'):
			# Execute
			await self.loader_service.unload_model_async()

			# Verify
			assert self.state_manager.current_state == ModelState.IDLE

	@pytest.mark.asyncio
	async def test_unload_model_async_handles_error(self):
		"""Test unload_model_async handles errors during unload."""
		# Setup
		mock_pipe = MagicMock()
		self.pipeline_manager.set_pipeline(mock_pipe, 'test/model')
		self.state_manager.set_state(ModelState.LOADED, StateTransitionReason.LOAD_COMPLETED)

		with patch.object(self.loader_service, 'unload_model_sync', side_effect=RuntimeError('Unload failed')):
			# Execute & Verify
			with pytest.raises(RuntimeError, match='Unload failed'):
				await self.loader_service.unload_model_async()

			# Verify state transitioned to ERROR
			assert self.state_manager.current_state == ModelState.ERROR

	@pytest.mark.asyncio
	async def test_unload_model_async_resets_from_error_state(self):
		"""Test unload_model_async resets from ERROR state to IDLE."""
		# Setup
		self.state_manager._state = ModelState.ERROR
		self.pipeline_manager.pipe = None

		with patch.object(self.loader_service, 'unload_model_sync'):
			# Execute
			await self.loader_service.unload_model_async()

			# Verify
			assert self.state_manager.current_state == ModelState.IDLE

	@pytest.mark.asyncio
	async def test_unload_model_async_cancels_in_progress_load(self):
		"""Test unload_model_async cancels in-progress load before unloading."""
		# Setup - simulate LOADING state
		self.state_manager._state = ModelState.LOADING

		with patch.object(self.loader_service, 'cancel_current_load', new_callable=AsyncMock) as mock_cancel:
			# After cancellation, state should be IDLE
			async def cancel_side_effect():
				self.state_manager._state = ModelState.IDLE

			mock_cancel.side_effect = cancel_side_effect

			# Execute
			await self.loader_service.unload_model_async()

			# Verify cancel was called
			mock_cancel.assert_called_once()


class TestCancelCurrentLoad:
	"""Test cancel_current_load() method."""

	def setup_method(self):
		"""Create fresh LoaderService for each test."""
		self.state_manager = StateManager()
		self.resource_manager = ResourceManager()
		self.pipeline_manager = PipelineManager()
		self.loader_service = LoaderService(self.state_manager, self.resource_manager, self.pipeline_manager)

	@pytest.mark.asyncio
	async def test_cancel_current_load_sets_cancel_token(self):
		"""Test cancel_current_load flags the cancel token."""
		from app.cores.model_loader import CancellationToken

		# Setup
		cancel_token = CancellationToken()
		self.loader_service.cancel_token = cancel_token
		self.loader_service.loading_task = None

		# Execute
		await self.loader_service.cancel_current_load()

		# Verify
		assert cancel_token.is_cancelled() is True

	@pytest.mark.asyncio
	async def test_cancel_current_load_waits_for_task_completion(self):
		"""Test cancel_current_load waits for loading_task to complete."""
		from app.cores.model_loader import CancellationToken

		# Setup - create a task that raises CancellationException
		async def fake_load_task():
			await asyncio.sleep(0.01)
			raise CancellationException('Cancelled')

		cancel_token = CancellationToken()
		self.loader_service.cancel_token = cancel_token
		task = asyncio.create_task(fake_load_task())
		self.loader_service.loading_task = task

		# Execute
		await self.loader_service.cancel_current_load()

		# Verify task completed
		assert task.done() is True

	@pytest.mark.asyncio
	async def test_cancel_current_load_handles_no_cancel_token(self):
		"""Test cancel_current_load handles case when cancel_token is None."""
		# Setup
		self.loader_service.cancel_token = None
		self.loader_service.loading_task = None

		# Execute - should not raise
		await self.loader_service.cancel_current_load()

	@pytest.mark.asyncio
	async def test_cancel_current_load_handles_already_done_task(self):
		"""Test cancel_current_load handles already completed task."""
		from app.cores.model_loader import CancellationToken

		# Setup - create completed task
		async def completed_task():
			return True

		cancel_token = CancellationToken()
		self.loader_service.cancel_token = cancel_token
		task = asyncio.create_task(completed_task())
		self.loader_service.loading_task = task
		await task  # Wait for completion

		# Execute - should not hang
		await self.loader_service.cancel_current_load()


class TestLoadModelSync:
	"""Test load_model_sync() method."""

	def setup_method(self):
		"""Create fresh LoaderService for each test."""
		self.state_manager = StateManager()
		self.resource_manager = ResourceManager()
		self.pipeline_manager = PipelineManager()
		self.loader_service = LoaderService(self.state_manager, self.resource_manager, self.pipeline_manager)

	@patch('app.cores.model_manager.loader_service.socket_service')
	@patch('app.cores.model_manager.loader_service.model_loader')
	def test_load_model_sync_loads_new_model(self, mock_model_loader, mock_socket):
		"""Test load_model_sync loads a new model successfully."""
		# Setup
		mock_pipe = MagicMock()
		mock_pipe.config = {'model_id': 'test/model'}
		mock_model_loader.return_value = mock_pipe

		# Execute
		result = self.loader_service.load_model_sync('test/model')

		# Verify
		assert result == {'model_id': 'test/model'}
		assert self.pipeline_manager.get_pipeline() == mock_pipe
		assert self.pipeline_manager.get_model_id() == 'test/model'
		mock_socket.model_load_completed.assert_called_once()

	@patch('app.cores.model_manager.loader_service.model_loader')
	def test_load_model_sync_unloads_existing_model_first(self, mock_model_loader):
		"""Test load_model_sync unloads existing model before loading new one."""
		# Setup - existing model loaded
		old_pipe = MagicMock()
		self.pipeline_manager.set_pipeline(old_pipe, 'old/model')

		new_pipe = MagicMock()
		new_pipe.config = {'model_id': 'new/model'}
		mock_model_loader.return_value = new_pipe

		with patch.object(self.loader_service, 'unload_model_sync') as mock_unload:
			# Execute
			self.loader_service.load_model_sync('new/model')

			# Verify unload was called
			mock_unload.assert_called_once()
			assert self.pipeline_manager.get_model_id() == 'new/model'

	@patch('app.cores.model_manager.loader_service.model_loader')
	def test_load_model_sync_passes_cancel_token(self, mock_model_loader):
		"""Test load_model_sync passes cancel_token to model_loader."""
		from app.cores.model_loader import CancellationToken

		# Setup
		cancel_token = CancellationToken()
		self.loader_service.cancel_token = cancel_token

		mock_pipe = MagicMock()
		mock_pipe.config = {}
		mock_model_loader.return_value = mock_pipe

		# Execute
		self.loader_service.load_model_sync('test/model')

		# Verify cancel_token was passed
		mock_model_loader.assert_called_once_with('test/model', cancel_token)


class TestUnloadModelSync:
	"""Test unload_model_sync() method."""

	def setup_method(self):
		"""Create fresh LoaderService for each test."""
		self.state_manager = StateManager()
		self.resource_manager = ResourceManager()
		self.pipeline_manager = PipelineManager()
		self.loader_service = LoaderService(self.state_manager, self.resource_manager, self.pipeline_manager)

	def test_unload_model_sync_cleans_up_pipeline(self):
		"""Test unload_model_sync calls cleanup_pipeline and clears pipeline."""
		# Setup
		mock_pipe = MagicMock()
		self.pipeline_manager.set_pipeline(mock_pipe, 'test/model')

		with patch.object(self.resource_manager, 'cleanup_pipeline') as mock_cleanup:
			# Execute
			self.loader_service.unload_model_sync()

			# Verify
			mock_cleanup.assert_called_once_with(mock_pipe, 'test/model')
			assert self.pipeline_manager.get_pipeline() is None
			assert self.pipeline_manager.get_model_id() is None

	def test_unload_model_sync_safe_when_no_model_loaded(self):
		"""Test unload_model_sync is safe to call when no model is loaded."""
		# Setup
		self.pipeline_manager.pipe = None
		self.pipeline_manager.model_id = None

		# Execute - should not raise
		self.loader_service.unload_model_sync()


class TestExecuteLoadInBackground:
	"""Test execute_load_in_background() method."""

	def setup_method(self):
		"""Create fresh LoaderService for each test."""
		self.state_manager = StateManager()
		self.resource_manager = ResourceManager()
		self.pipeline_manager = PipelineManager()
		self.loader_service = LoaderService(self.state_manager, self.resource_manager, self.pipeline_manager)

	@pytest.mark.asyncio
	async def test_execute_load_in_background_runs_in_executor(self):
		"""Test execute_load_in_background executes load_model_sync in executor."""
		# Setup
		mock_config = {'model_id': 'test/model'}

		with patch.object(self.loader_service, 'load_model_sync', return_value=mock_config) as mock_load:
			# Execute
			result = await self.loader_service.execute_load_in_background('test/model')

			# Verify
			assert result == mock_config
			mock_load.assert_called_once_with('test/model')
