"""Tests for gpu_utils module."""

from unittest.mock import MagicMock, patch


class TestCleanupGpuModel:
	"""Test cleanup_gpu_model function."""

	def test_cleanup_with_none_model_returns_zero_metrics(self):
		"""Test that cleanup with None model returns zero metrics (line 32)."""
		from app.cores.gpu_utils import cleanup_gpu_model

		# Execute
		result = cleanup_gpu_model(None, 'test_model')

		# Verify
		assert result.time_ms == 0
		assert result.objects_collected == 0
		assert result.error is None

	@patch('app.cores.gpu_utils.time')
	@patch('app.cores.gpu_utils.gc')
	def test_cleanup_with_cuda_available(self, mock_gc, mock_time):
		"""Test cleanup with CUDA available."""
		from app.cores.gpu_utils import cleanup_gpu_model

		# Setup
		mock_model = MagicMock()
		mock_gc.collect.return_value = 42
		mock_time.time.side_effect = [0.0, 0.010]  # Start and end time (10ms elapsed)

		with patch('app.cores.gpu_utils.clear_device_cache') as mock_clear_cache:
			# Execute
			result = cleanup_gpu_model(mock_model, 'test_model')

			# Verify
			assert result.time_ms > 0
			assert result.objects_collected == 42
			assert result.error is None
			mock_gc.collect.assert_called_once()
			mock_clear_cache.assert_called_once()

	@patch('app.cores.gpu_utils.time')
	@patch('app.cores.gpu_utils.gc')
	def test_cleanup_without_cuda(self, mock_gc, mock_time):
		"""Test cleanup without CUDA available."""
		from app.cores.gpu_utils import cleanup_gpu_model

		# Setup
		mock_model = MagicMock()
		mock_gc.collect.return_value = 15
		mock_time.time.side_effect = [0.0, 0.005]  # Start and end time (5ms elapsed)

		with patch('app.cores.gpu_utils.clear_device_cache') as mock_clear_cache:
			# Execute
			result = cleanup_gpu_model(mock_model, 'test_model')

			# Verify
			assert result.time_ms > 0
			assert result.objects_collected == 15
			assert result.error is None
			mock_gc.collect.assert_called_once()
			mock_clear_cache.assert_called_once()

	@patch('app.cores.gpu_utils.gc')
	@patch('app.cores.gpu_utils.torch')
	def test_cleanup_handles_exception(self, mock_torch, mock_gc):
		"""Test cleanup handles exceptions gracefully (lines 48-50)."""
		from app.cores.gpu_utils import cleanup_gpu_model

		# Setup - make gc.collect raise an exception
		mock_model = MagicMock()
		mock_gc.collect.side_effect = RuntimeError('GC failed')

		# Execute - should not raise
		result = cleanup_gpu_model(mock_model, 'test_model')

		# Verify
		assert result.time_ms == 0
		assert result.objects_collected == 0
		assert result.error == 'GC failed'

	@patch('app.cores.gpu_utils.time')
	@patch('app.cores.gpu_utils.gc')
	@patch('app.cores.gpu_utils.torch')
	def test_cleanup_measures_time_correctly(self, mock_torch, mock_gc, mock_time):
		"""Test that cleanup measures elapsed time correctly."""
		from app.cores.gpu_utils import cleanup_gpu_model

		# Setup - mock time to return specific values
		mock_time.time.side_effect = [1.0, 1.5]  # 500ms elapsed
		mock_model = MagicMock()
		mock_gc.collect.return_value = 10
		mock_torch.cuda.is_available.return_value = False

		# Execute
		result = cleanup_gpu_model(mock_model, 'test_model')

		# Verify - 500ms * 1000 = 500 milliseconds
		assert result.time_ms == 500.0
		assert result.objects_collected == 10


class TestClearDeviceCache:
	"""Tests for clear_device_cache helper."""

	@patch('app.cores.gpu_utils.logger')
	def test_skips_when_no_accelerator(self, mock_logger):
		"""Helper logs and returns None when no accelerator is available."""
		from app.cores.gpu_utils import clear_device_cache

		with patch('app.cores.gpu_utils.device_service') as mock_device:
			mock_device.is_available = False

			clear_device_cache(reason='unit-test')

		mock_logger.info.assert_called_with('Skipped device cache clear: accelerator not available')

	@patch('app.cores.gpu_utils.logger')
	def test_skips_when_no_supported_accelerator(self, mock_logger):
		"""Helper logs when device available but neither CUDA nor MPS active."""
		from app.cores.gpu_utils import clear_device_cache

		with patch('app.cores.gpu_utils.device_service') as mock_device:
			mock_device.is_available = True
			mock_device.is_cuda = False
			mock_device.is_mps = False

			clear_device_cache(reason='unit-test')

		mock_logger.info.assert_called_with('Skipped device cache clear: no supported accelerator detected')

	@patch('app.cores.gpu_utils.torch')
	def test_clears_cuda_cache(self, mock_torch):
		"""Helper clears CUDA cache."""
		from app.cores.gpu_utils import clear_device_cache

		mock_torch.cuda.is_available.return_value = True

		with patch('app.cores.gpu_utils.device_service') as mock_device:
			mock_device.is_available = True
			mock_device.is_cuda = True
			mock_device.is_mps = False

			clear_device_cache(reason='cuda-test')

		mock_torch.cuda.empty_cache.assert_called_once()

	@patch('app.cores.gpu_utils.torch')
	def test_clears_mps_cache(self, mock_torch):
		"""Helper clears MPS cache when device is Apple Silicon."""
		from app.cores.gpu_utils import clear_device_cache

		mock_torch.cuda.is_available.return_value = False
		mock_torch.mps = MagicMock()

		with patch('app.cores.gpu_utils.device_service') as mock_device:
			mock_device.is_available = True
			mock_device.is_cuda = False
			mock_device.is_mps = True

			clear_device_cache(reason='mps-test')
		mock_torch.mps.empty_cache.assert_called_once()

	@patch('app.cores.gpu_utils.logger')
	@patch('app.cores.gpu_utils.torch')
	def test_logs_warning_when_clear_fails(self, mock_torch, mock_logger):
		"""Helper logs warning when accelerator cleanup raises."""
		from app.cores.gpu_utils import clear_device_cache

		mock_torch.cuda.is_available.return_value = True
		mock_torch.cuda.empty_cache.side_effect = RuntimeError('boom')

		with patch('app.cores.gpu_utils.device_service') as mock_device:
			mock_device.is_available = True
			mock_device.is_cuda = True
			mock_device.is_mps = False

			clear_device_cache(reason='failure-test')

		mock_logger.warning.assert_called_once()
