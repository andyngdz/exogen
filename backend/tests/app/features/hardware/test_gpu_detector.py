"""Tests for GPU detector orchestrator."""

from unittest.mock import MagicMock, PropertyMock, patch

from app.constants.platform import OperatingSystem
from app.features.hardware.gpu_detector import GPUDetector
from app.features.hardware.info import GPUInfo
from app.schemas.hardware import GPUDriverInfo, GPUDriverStatusStates


class TestGPUDetector:
	"""Test GPU detector orchestration logic."""

	def setup_method(self):
		"""Set up test fixtures."""
		# Clear cache before each test
		GPUDetector.detect.cache_clear()
		self.detector = GPUDetector()

	@patch('app.features.hardware.gpu_detector.device_service')
	@patch('app.features.hardware.gpu_detector.OperatingSystem.from_platform_system')
	@patch('app.features.hardware.gpu_detector.torch')
	def test_detect_on_windows_uses_nvidia_detector(self, mock_torch, mock_from_platform, mock_device_service):
		"""Test detect() on Windows uses NVIDIA detector."""
		mock_from_platform.return_value = OperatingSystem.WINDOWS
		mock_device_service.is_cuda = True
		mock_torch.backends = MagicMock()

		with patch.object(self.detector.nvidia_detector, 'detect') as mock_nvidia_detect:
			info = self.detector.detect()

			mock_nvidia_detect.assert_called_once()
			assert isinstance(info, GPUDriverInfo)

	@patch('app.features.hardware.gpu_detector.device_service')
	@patch('app.features.hardware.gpu_detector.OperatingSystem.from_platform_system')
	@patch('app.features.hardware.gpu_detector.torch')
	def test_detect_on_linux_uses_nvidia_detector(self, mock_torch, mock_from_platform, mock_device_service):
		"""Test detect() on Linux uses NVIDIA detector."""
		mock_from_platform.return_value = OperatingSystem.LINUX
		mock_device_service.is_cuda = True
		mock_torch.backends = MagicMock()

		with patch.object(self.detector.nvidia_detector, 'detect') as mock_nvidia_detect:
			info = self.detector.detect()

			mock_nvidia_detect.assert_called_once()
			assert isinstance(info, GPUDriverInfo)

	@patch('app.features.hardware.gpu_detector.device_service')
	@patch('app.features.hardware.gpu_detector.OperatingSystem.from_platform_system')
	@patch('app.features.hardware.gpu_detector.torch')
	def test_detect_on_darwin_with_mps_uses_mps_detector(self, mock_torch, mock_from_platform, mock_device_service):
		"""Test detect() on macOS with MPS uses MPS detector."""
		mock_from_platform.return_value = OperatingSystem.DARWIN
		mock_device_service.is_cuda = False

		mock_backends = MagicMock()
		mock_backends.mps.is_available.return_value = True
		mock_torch.backends = mock_backends

		with patch.object(self.detector.mps_detector, 'detect') as mock_mps_detect:
			info = self.detector.detect()

			mock_mps_detect.assert_called_once()
			assert isinstance(info, GPUDriverInfo)

	@patch('app.features.hardware.gpu_detector.device_service')
	@patch('app.features.hardware.gpu_detector.OperatingSystem.from_platform_system')
	@patch('app.features.hardware.gpu_detector.torch')
	def test_detect_on_darwin_without_mps_calls_handle_no_mps(self, mock_torch, mock_from_platform, mock_device_service):
		"""Test detect() on macOS without MPS calls handle_no_mps."""
		mock_from_platform.return_value = OperatingSystem.DARWIN
		mock_device_service.is_cuda = False

		mock_backends = MagicMock()
		mock_backends.mps.is_available.return_value = False
		mock_torch.backends = mock_backends

		with patch.object(self.detector.mps_detector, 'handle_no_mps') as mock_handle_no_mps:
			info = self.detector.detect()

			mock_handle_no_mps.assert_called_once()
			assert isinstance(info, GPUDriverInfo)

	@patch('app.features.hardware.gpu_detector.device_service')
	@patch('app.features.hardware.gpu_detector.OperatingSystem.from_platform_system')
	@patch('app.features.hardware.gpu_detector.torch')
	def test_detect_on_unsupported_os(self, mock_torch, mock_from_platform, mock_device_service):
		"""Test detect() on unsupported OS."""
		mock_unsupported_os = MagicMock()
		mock_unsupported_os.value = 'FreeBSD'
		mock_from_platform.return_value = mock_unsupported_os
		mock_device_service.is_cuda = False
		mock_torch.backends = MagicMock()

		info = self.detector.detect()

		assert info.overall_status == GPUDriverStatusStates.NO_GPU
		assert info.message == GPUInfo.unsupported_os('FreeBSD')

	@patch('app.features.hardware.gpu_detector.device_service')
	@patch('app.features.hardware.gpu_detector.OperatingSystem.from_platform_system')
	@patch('app.features.hardware.gpu_detector.torch')
	def test_detect_handles_import_error(self, mock_torch, mock_from_platform, mock_device_service):
		"""Test detect() handles ImportError."""
		mock_from_platform.return_value = OperatingSystem.LINUX
		mock_device_service.is_cuda = False
		type(mock_torch).backends = PropertyMock(side_effect=ImportError('PyTorch not found'))

		info = self.detector.detect()

		assert info.overall_status == GPUDriverStatusStates.UNKNOWN_ERROR
		assert info.message == GPUInfo.pytorch_not_installed()
		assert info.troubleshooting_steps == GPUInfo.pytorch_troubleshooting()

	@patch('app.features.hardware.gpu_detector.device_service')
	@patch('app.features.hardware.gpu_detector.OperatingSystem.from_platform_system')
	@patch('app.features.hardware.gpu_detector.torch')
	def test_detect_handles_runtime_error(self, mock_torch, mock_from_platform, mock_device_service):
		"""Test detect() handles RuntimeError."""
		mock_from_platform.return_value = OperatingSystem.LINUX
		mock_device_service.is_cuda = False
		mock_torch.backends = MagicMock()

		error_message = 'Unexpected runtime error'
		with patch.object(self.detector.nvidia_detector, 'detect', side_effect=RuntimeError(error_message)):
			info = self.detector.detect()

		assert info.overall_status == GPUDriverStatusStates.UNKNOWN_ERROR
		assert info.message == GPUInfo.unexpected_error(error_message)
		assert info.troubleshooting_steps == GPUInfo.error_troubleshooting_steps()

	@patch('app.features.hardware.gpu_detector.device_service')
	@patch('app.features.hardware.gpu_detector.OperatingSystem.from_platform_system')
	@patch('app.features.hardware.gpu_detector.torch')
	def test_clear_cache_clears_detect_cache(self, mock_torch, mock_from_platform, mock_device_service):
		"""Test clear_cache() clears the detect method cache."""
		mock_from_platform.return_value = OperatingSystem.LINUX
		mock_device_service.is_cuda = False
		mock_torch.backends = MagicMock()

		# Call detect to populate cache
		self.detector.detect()

		# Verify cache has data
		cache_info = self.detector.detect.cache_info()
		assert cache_info.currsize > 0

		# Clear cache
		self.detector.clear_cache()

		# Verify cache is cleared
		cache_info = self.detector.detect.cache_info()
		assert cache_info.currsize == 0

	@patch('app.features.hardware.gpu_detector.device_service')
	def test_create_default_info_returns_correct_structure(self, mock_device_service):
		"""Test _create_default_info() returns correct GPUDriverInfo structure."""
		mock_device_service.is_cuda = True

		info = self.detector._create_default_info()

		assert isinstance(info, GPUDriverInfo)
		assert info.gpus == []
		assert info.is_cuda is True
		assert info.message == GPUInfo.default_detecting()
		assert info.overall_status == GPUDriverStatusStates.UNKNOWN_ERROR
