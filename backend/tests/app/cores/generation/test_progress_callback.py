"""Tests for progress_callback module."""

from unittest.mock import MagicMock, patch

import pytest
import torch


@pytest.fixture
def progress_callback():
	"""Get a fresh ProgressCallback instance."""
	from app.cores.generation.progress_callback import ProgressCallback

	return ProgressCallback()


class TestProgressCallbackReset:
	"""Test reset() method."""

	def test_reset_clears_step_count(self, progress_callback):
		"""Test that reset clears step count (line 21)."""
		# Setup
		progress_callback.step_count = 5

		# Execute
		progress_callback.reset()

		# Verify
		assert progress_callback.step_count == 0

	def test_reset_calls_clear_tensor_cache_if_available(self, progress_callback):
		"""Test that reset calls clear_tensor_cache if method exists (lines 22-24)."""
		# Setup - add clear_tensor_cache method to image_processor
		progress_callback.image_processor.clear_tensor_cache = MagicMock()

		# Execute
		progress_callback.reset()

		# Verify
		progress_callback.image_processor.clear_tensor_cache.assert_called_once()

	def test_reset_handles_missing_clear_tensor_cache(self, progress_callback):
		"""Test that reset handles when clear_tensor_cache doesn't exist."""
		# Setup - ensure clear_tensor_cache doesn't exist
		if hasattr(progress_callback.image_processor, 'clear_tensor_cache'):
			delattr(progress_callback.image_processor, 'clear_tensor_cache')

		# Execute - should not raise
		progress_callback.reset()

		# Verify
		assert progress_callback.step_count == 0


class TestCallbackOnStepEnd:
	"""Test callback_on_step_end() method."""

	@patch('app.cores.generation.progress_callback.socket_service')
	@patch('app.cores.generation.progress_callback.image_service')
	def test_callback_processes_latents_and_emits_socket_event(
		self, mock_image_service, mock_socket_service, progress_callback
	):
		"""Test callback processes latents and emits socket event."""
		# Setup
		mock_pipe = MagicMock()
		mock_latents = torch.randn(1, 4, 64, 64)
		callback_kwargs = {'latents': mock_latents}

		mock_image = MagicMock()
		progress_callback.image_processor.latents_to_rgb = MagicMock(return_value=mock_image)
		mock_image_service.to_base64.return_value = 'base64_encoded_image'

		# Execute
		result = progress_callback.callback_on_step_end(mock_pipe, 5, 0.5, callback_kwargs)

		# Verify
		assert result == callback_kwargs
		progress_callback.image_processor.latents_to_rgb.assert_called_once()
		mock_image_service.to_base64.assert_called_once_with(mock_image)
		mock_socket_service.image_generation_step_end.assert_called_once()

	@patch('app.cores.generation.progress_callback.clear_device_cache')
	@patch('app.cores.generation.progress_callback.socket_service')
	@patch('app.cores.generation.progress_callback.image_service')
	def test_callback_performs_periodic_cache_cleanup(
		self, mock_image_service, mock_socket_service, mock_clear_cache, progress_callback
	):
		"""Test that callback performs periodic cache cleanup every 3 steps (line 76)."""
		# Setup
		mock_pipe = MagicMock()
		mock_latents = torch.randn(1, 4, 64, 64)
		callback_kwargs = {'latents': mock_latents}

		progress_callback.image_processor.latents_to_rgb = MagicMock(return_value=MagicMock())
		mock_image_service.to_base64.return_value = 'base64'

		# Execute steps 1-2 (no cleanup yet)
		for step in range(1, 3):
			progress_callback.callback_on_step_end(mock_pipe, step, 0.5, callback_kwargs)

		# Verify no cache clear yet
		mock_clear_cache.assert_not_called()

		# Execute step 3 (should trigger cleanup)
		progress_callback.callback_on_step_end(mock_pipe, 3, 0.5, callback_kwargs)

		# Verify cache was cleared once
		mock_clear_cache.assert_called_once()

		# Execute steps 4-5 (no cleanup)
		for step in range(4, 6):
			progress_callback.callback_on_step_end(mock_pipe, step, 0.5, callback_kwargs)

		# Still only 1 clear
		assert mock_clear_cache.call_count == 1

		# Execute step 6 (should trigger second cleanup)
		progress_callback.callback_on_step_end(mock_pipe, 6, 0.5, callback_kwargs)

		# Verify cache was cleared twice total
		assert mock_clear_cache.call_count == 2
