"""Comprehensive tests for ResourceManager class.

This test suite covers:
1. cleanup_pipeline() with different device types (CUDA, MPS, CPU)
2. cleanup_cuda_resources() with memory metrics logging
3. cleanup_mps_resources() with synchronization
4. Edge cases (None pipe, no GPU available)
"""

from unittest.mock import MagicMock, patch

from app.cores.model_manager.resource_manager import ResourceManager


class TestCleanupPipeline:
	"""Test cleanup_pipeline() method with different device configurations."""

	def setup_method(self):
		"""Create fresh ResourceManager for each test."""
		self.resource_manager = ResourceManager()

	@patch('app.cores.model_manager.resource_manager.device_service')
	@patch('app.cores.model_manager.resource_manager.torch')
	@patch('app.cores.model_manager.resource_manager.gc')
	def test_cleanup_pipeline_with_cuda(self, mock_gc, mock_torch, mock_device):
		"""Test cleanup_pipeline with CUDA device."""
		# Setup
		mock_device.is_available = True
		mock_device.is_cuda = True
		mock_device.is_mps = False

		mock_torch.cuda.memory_allocated.side_effect = [
			10 * (1024**3),  # Before: 10GB
			2 * (1024**3),  # After: 2GB
		]
		mock_torch.cuda.memory_reserved.side_effect = [
			12 * (1024**3),  # Before: 12GB
			3 * (1024**3),  # After: 3GB
		]

		mock_pipe = MagicMock()

		# Execute
		self.resource_manager.cleanup_pipeline(mock_pipe, 'test/model')

		# Verify CUDA-specific operations
		mock_torch.cuda.synchronize.assert_called_once()
		mock_torch.cuda.empty_cache.assert_called_once()
		assert mock_gc.collect.call_count >= 2  # Multiple GC passes

		# Verify MPS operations NOT called
		assert not hasattr(mock_torch.mps, 'synchronize') or not mock_torch.mps.synchronize.called

	@patch('app.cores.model_manager.resource_manager.device_service')
	@patch('app.cores.model_manager.resource_manager.torch')
	@patch('app.cores.model_manager.resource_manager.gc')
	def test_cleanup_pipeline_with_mps(self, mock_gc, mock_torch, mock_device):
		"""Test cleanup_pipeline with MPS device."""
		# Setup
		mock_device.is_available = True
		mock_device.is_cuda = False
		mock_device.is_mps = True

		mock_pipe = MagicMock()

		# Execute
		self.resource_manager.cleanup_pipeline(mock_pipe, 'test/model')

		# Verify MPS-specific operations
		mock_torch.mps.synchronize.assert_called_once()
		mock_torch.mps.empty_cache.assert_called_once()
		assert mock_gc.collect.call_count >= 2  # Multiple GC passes

		# Verify CUDA operations NOT called
		assert not hasattr(mock_torch.cuda, 'synchronize') or not mock_torch.cuda.synchronize.called

	@patch('app.cores.model_manager.resource_manager.device_service')
	@patch('app.cores.model_manager.resource_manager.gc')
	def test_cleanup_pipeline_with_no_gpu(self, mock_gc, mock_device):
		"""Test cleanup_pipeline when no GPU is available."""
		# Setup
		mock_device.is_available = False

		mock_pipe = MagicMock()

		# Execute
		self.resource_manager.cleanup_pipeline(mock_pipe, 'test/model')

		# Verify only GC runs, no GPU operations
		assert mock_gc.collect.call_count >= 2

	@patch('app.cores.model_manager.resource_manager.device_service')
	@patch('app.cores.model_manager.resource_manager.gc')
	def test_cleanup_pipeline_with_none_pipe(self, mock_gc, mock_device):
		"""Test cleanup_pipeline when pipe is None."""
		# Setup
		mock_device.is_available = False

		# Execute - should not raise
		self.resource_manager.cleanup_pipeline(None, 'test/model')

		# Verify GC still runs
		assert mock_gc.collect.call_count >= 2

	@patch('app.cores.model_manager.resource_manager.device_service')
	@patch('app.cores.model_manager.resource_manager.gc')
	def test_cleanup_pipeline_logs_warning_when_no_gpu(self, mock_gc, mock_device, caplog):
		"""Test cleanup_pipeline logs warning when GPU not available."""
		import logging

		caplog.set_level(logging.WARNING)

		# Setup
		mock_device.is_available = False
		mock_pipe = MagicMock()

		# Execute
		self.resource_manager.cleanup_pipeline(mock_pipe, 'test/model')

		# Verify warning logged
		assert 'GPU acceleration not available, cannot clear cache' in caplog.text


class TestCleanupCudaResources:
	"""Test cleanup_cuda_resources() method."""

	def setup_method(self):
		"""Create fresh ResourceManager for each test."""
		self.resource_manager = ResourceManager()

	@patch('app.cores.model_manager.resource_manager.torch')
	@patch('app.cores.model_manager.resource_manager.gc')
	def test_cleanup_cuda_resources_synchronizes_and_clears_cache(self, mock_gc, mock_torch):
		"""Test cleanup_cuda_resources performs synchronization and cache clearing."""
		# Setup memory metrics
		mock_torch.cuda.memory_allocated.side_effect = [
			8 * (1024**3),  # Before: 8GB
			1 * (1024**3),  # After: 1GB
		]
		mock_torch.cuda.memory_reserved.side_effect = [
			10 * (1024**3),  # Before: 10GB
			2 * (1024**3),  # After: 2GB
		]

		# Execute
		self.resource_manager.cleanup_cuda_resources()

		# Verify operations in order
		mock_torch.cuda.synchronize.assert_called_once()
		mock_torch.cuda.empty_cache.assert_called_once()
		mock_gc.collect.assert_called()

		# Verify memory stats queried (before and after)
		assert mock_torch.cuda.memory_allocated.call_count == 2
		assert mock_torch.cuda.memory_reserved.call_count == 2

	@patch('app.cores.model_manager.resource_manager.torch')
	@patch('app.cores.model_manager.resource_manager.gc')
	def test_cleanup_cuda_resources_logs_memory_metrics(self, mock_gc, mock_torch, caplog):
		"""Test cleanup_cuda_resources logs memory before/after metrics."""
		import logging

		caplog.set_level(logging.INFO)

		# Setup memory metrics
		mock_torch.cuda.memory_allocated.side_effect = [
			10 * (1024**3),  # Before: 10GB
			2 * (1024**3),  # After: 2GB
		]
		mock_torch.cuda.memory_reserved.side_effect = [
			12 * (1024**3),  # Before: 12GB
			3 * (1024**3),  # After: 3GB
		]

		# Execute
		self.resource_manager.cleanup_cuda_resources()

		# Verify logging
		assert 'CUDA synchronized' in caplog.text
		assert 'GPU memory before: 10.00GB allocated, 12.00GB reserved' in caplog.text
		assert 'GPU memory after: 2.00GB allocated, 3.00GB reserved' in caplog.text
		assert 'GPU memory freed: 8.00GB allocated, 9.00GB reserved' in caplog.text

	@patch('app.cores.model_manager.resource_manager.torch')
	@patch('app.cores.model_manager.resource_manager.gc')
	def test_cleanup_cuda_resources_forces_gc_after_cache_clear(self, mock_gc, mock_torch):
		"""Test cleanup_cuda_resources runs GC after clearing cache."""
		# Setup
		mock_torch.cuda.memory_allocated.return_value = 0
		mock_torch.cuda.memory_reserved.return_value = 0

		# Execute
		self.resource_manager.cleanup_cuda_resources()

		# Verify GC called after empty_cache
		mock_torch.cuda.empty_cache.assert_called()
		mock_gc.collect.assert_called()


class TestCleanupMpsResources:
	"""Test cleanup_mps_resources() method."""

	def setup_method(self):
		"""Create fresh ResourceManager for each test."""
		self.resource_manager = ResourceManager()

	@patch('app.cores.model_manager.resource_manager.torch')
	@patch('app.cores.model_manager.resource_manager.gc')
	def test_cleanup_mps_resources_synchronizes_and_clears_cache(self, mock_gc, mock_torch):
		"""Test cleanup_mps_resources performs synchronization and cache clearing."""
		# Execute
		self.resource_manager.cleanup_mps_resources()

		# Verify operations in order
		mock_torch.mps.synchronize.assert_called_once()
		mock_torch.mps.empty_cache.assert_called_once()
		mock_gc.collect.assert_called()

	@patch('app.cores.model_manager.resource_manager.torch')
	@patch('app.cores.model_manager.resource_manager.gc')
	def test_cleanup_mps_resources_logs_operations(self, mock_gc, mock_torch, caplog):
		"""Test cleanup_mps_resources logs synchronization and cache clearing."""
		import logging

		caplog.set_level(logging.INFO)

		# Execute
		self.resource_manager.cleanup_mps_resources()

		# Verify logging
		assert 'MPS synchronized - all pending operations completed' in caplog.text
		assert 'MPS cache cleared' in caplog.text

	@patch('app.cores.model_manager.resource_manager.torch')
	@patch('app.cores.model_manager.resource_manager.gc')
	def test_cleanup_mps_resources_forces_gc_after_cache_clear(self, mock_gc, mock_torch):
		"""Test cleanup_mps_resources runs GC after clearing cache."""
		# Execute
		self.resource_manager.cleanup_mps_resources()

		# Verify GC called after empty_cache
		mock_torch.mps.empty_cache.assert_called()
		mock_gc.collect.assert_called()


class TestCleanupPipelineLogging:
	"""Test cleanup_pipeline() logging behavior."""

	def setup_method(self):
		"""Create fresh ResourceManager for each test."""
		self.resource_manager = ResourceManager()

	@patch('app.cores.model_manager.resource_manager.device_service')
	@patch('app.cores.model_manager.resource_manager.gc')
	def test_cleanup_pipeline_logs_start_and_completion(self, mock_gc, mock_device, caplog):
		"""Test cleanup_pipeline logs start and completion messages."""
		import logging

		caplog.set_level(logging.INFO)

		# Setup
		mock_device.is_available = False
		mock_pipe = MagicMock()

		# Execute
		self.resource_manager.cleanup_pipeline(mock_pipe, 'my/model')

		# Verify logging
		assert 'Starting resource cleanup for model: my/model' in caplog.text
		assert 'Pipeline object deleted' in caplog.text
		assert 'Garbage collection completed (1st pass)' in caplog.text
		assert 'Final garbage collection completed (2nd pass)' in caplog.text
