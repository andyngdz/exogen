"""Tests for resource_manager module."""

from unittest.mock import patch


class TestPrepareForGeneration:
	"""Test prepare_for_generation() method."""

	@patch('app.cores.generation.resource_manager.progress_callback')
	@patch('app.cores.generation.resource_manager.memory_manager')
	def test_clears_memory_cache(self, mock_memory_manager, mock_progress_callback):
		"""Test that memory cache is cleared before generation."""
		from app.cores.generation.resource_manager import ResourceManager

		manager = ResourceManager()
		manager.prepare_for_generation()

		mock_memory_manager.clear_cache.assert_called_once()

	@patch('app.cores.generation.resource_manager.progress_callback')
	@patch('app.cores.generation.resource_manager.memory_manager')
	def test_resets_progress_callback(self, mock_memory_manager, mock_progress_callback):
		"""Test that progress callback is reset before generation."""
		from app.cores.generation.resource_manager import ResourceManager

		manager = ResourceManager()
		manager.prepare_for_generation()

		mock_progress_callback.reset.assert_called_once()

	@patch('app.cores.generation.resource_manager.progress_callback')
	@patch('app.cores.generation.resource_manager.memory_manager')
	def test_calls_in_correct_order(self, mock_memory_manager, mock_progress_callback):
		"""Test that cache clear happens before progress reset."""
		from app.cores.generation.resource_manager import ResourceManager

		# Setup call tracker
		call_order = []
		mock_memory_manager.clear_cache.side_effect = lambda: call_order.append('cache')
		mock_progress_callback.reset.side_effect = lambda: call_order.append('progress')

		manager = ResourceManager()
		manager.prepare_for_generation()

		assert call_order == ['cache', 'progress']


class TestCleanupAfterGeneration:
	"""Test cleanup_after_generation() method."""

	@patch('app.cores.generation.resource_manager.progress_callback')
	@patch('app.cores.generation.resource_manager.memory_manager')
	def test_clears_memory_cache(self, mock_memory_manager, mock_progress_callback):
		"""Test that memory cache is cleared after generation."""
		from app.cores.generation.resource_manager import ResourceManager

		manager = ResourceManager()
		manager.cleanup_after_generation()

		mock_memory_manager.clear_cache.assert_called_once()

	@patch('app.cores.generation.resource_manager.progress_callback')
	@patch('app.cores.generation.resource_manager.memory_manager')
	def test_resets_progress_callback(self, mock_memory_manager, mock_progress_callback):
		"""Test that progress callback is reset after generation."""
		from app.cores.generation.resource_manager import ResourceManager

		manager = ResourceManager()
		manager.cleanup_after_generation()

		mock_progress_callback.reset.assert_called_once()

	@patch('app.cores.generation.resource_manager.progress_callback')
	@patch('app.cores.generation.resource_manager.memory_manager')
	def test_safe_to_call_multiple_times(self, mock_memory_manager, mock_progress_callback):
		"""Test that cleanup can be called multiple times safely."""
		from app.cores.generation.resource_manager import ResourceManager

		manager = ResourceManager()
		manager.cleanup_after_generation()
		manager.cleanup_after_generation()

		assert mock_memory_manager.clear_cache.call_count == 2
		assert mock_progress_callback.reset.call_count == 2


class TestHandleOomError:
	"""Test handle_oom_error() method."""

	@patch('app.cores.generation.resource_manager.logger')
	@patch('app.cores.generation.resource_manager.image_processor')
	@patch('app.cores.generation.resource_manager.memory_manager')
	def test_logs_oom_error(self, mock_memory_manager, mock_image_processor, mock_logger):
		"""Test that OOM error is logged."""
		from app.cores.generation.resource_manager import ResourceManager

		manager = ResourceManager()
		manager.handle_oom_error()

		mock_logger.error.assert_called_once()
		assert 'Out of memory' in str(mock_logger.error.call_args)

	@patch('app.cores.generation.resource_manager.logger')
	@patch('app.cores.generation.resource_manager.image_processor')
	@patch('app.cores.generation.resource_manager.memory_manager')
	def test_clears_memory_cache(self, mock_memory_manager, mock_image_processor, mock_logger):
		"""Test that memory cache is cleared on OOM."""
		from app.cores.generation.resource_manager import ResourceManager

		manager = ResourceManager()
		manager.handle_oom_error()

		mock_memory_manager.clear_cache.assert_called_once()

	@patch('app.cores.generation.resource_manager.logger')
	@patch('app.cores.generation.resource_manager.image_processor')
	@patch('app.cores.generation.resource_manager.memory_manager')
	def test_clears_tensor_cache(self, mock_memory_manager, mock_image_processor, mock_logger):
		"""Test that tensor cache is cleared on OOM."""
		from app.cores.generation.resource_manager import ResourceManager

		manager = ResourceManager()
		manager.handle_oom_error()

		mock_image_processor.clear_tensor_cache.assert_called_once()

	@patch('app.cores.generation.resource_manager.logger')
	@patch('app.cores.generation.resource_manager.image_processor')
	@patch('app.cores.generation.resource_manager.memory_manager')
	def test_all_cleanup_steps_called(self, mock_memory_manager, mock_image_processor, mock_logger):
		"""Test that all cleanup steps are performed on OOM."""
		from app.cores.generation.resource_manager import ResourceManager

		manager = ResourceManager()
		manager.handle_oom_error()

		# Verify all cleanup actions
		mock_logger.error.assert_called_once()
		mock_memory_manager.clear_cache.assert_called_once()
		mock_image_processor.clear_tensor_cache.assert_called_once()


class TestResourceManagerSingleton:
	"""Test resource_manager singleton."""

	def test_singleton_exists(self):
		"""Test that resource_manager singleton instance exists."""
		from app.cores.generation.resource_manager import resource_manager

		assert resource_manager is not None

	def test_singleton_has_required_methods(self):
		"""Test that singleton has all required methods."""
		from app.cores.generation.resource_manager import resource_manager

		assert hasattr(resource_manager, 'prepare_for_generation')
		assert hasattr(resource_manager, 'cleanup_after_generation')
		assert hasattr(resource_manager, 'handle_oom_error')
		assert callable(resource_manager.prepare_for_generation)
		assert callable(resource_manager.cleanup_after_generation)
		assert callable(resource_manager.handle_oom_error)
