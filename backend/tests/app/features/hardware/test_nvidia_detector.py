"""Tests for NVIDIA GPU detector."""

from unittest.mock import MagicMock, patch

from app.constants.platform import OperatingSystem
from app.features.hardware.info import GPUInfo
from app.features.hardware.nvidia_detector import NvidiaDetector
from app.schemas.hardware import GPUDriverInfo, GPUDriverStatusStates


class TestNvidiaDetector:
	"""Test NVIDIA GPU detection logic."""

	def setup_method(self):
		"""Set up test fixtures."""
		self.detector = NvidiaDetector()
		self.info = GPUDriverInfo(
			gpus=[],
			is_cuda=False,
			message='',
			overall_status=GPUDriverStatusStates.UNKNOWN_ERROR,
		)

	@patch('app.features.hardware.nvidia_detector.device_service')
	def test_detect_with_cuda_available(self, mock_device_service):
		"""Test detect() when CUDA is available."""
		mock_device_service.is_cuda = True
		mock_device_service.device_count = 0

		with patch.object(self.detector, '_detect_cuda_gpus') as mock_detect_cuda:
			self.detector.detect(OperatingSystem.LINUX, self.info)
			mock_detect_cuda.assert_called_once_with(OperatingSystem.LINUX, self.info)

	@patch('app.features.hardware.nvidia_detector.device_service')
	def test_detect_without_cuda(self, mock_device_service):
		"""Test detect() when CUDA is not available."""
		mock_device_service.is_cuda = False

		with patch.object(self.detector, '_handle_no_cuda') as mock_handle_no_cuda:
			self.detector.detect(OperatingSystem.LINUX, self.info)
			mock_handle_no_cuda.assert_called_once_with(OperatingSystem.LINUX, self.info)

	@patch('app.features.hardware.nvidia_detector.torch')
	@patch('app.features.hardware.nvidia_detector.device_service')
	def test_detect_cuda_gpus_sets_status_and_message(self, mock_device_service, mock_torch):
		"""Test _detect_cuda_gpus() sets correct status and message."""
		mock_device_service.device_count = 0
		mock_version = MagicMock()
		mock_version.cuda = '11.8'
		mock_torch.version = mock_version

		with patch.object(self.detector, '_get_driver_version', return_value='525.60.11'):
			self.detector._detect_cuda_gpus(OperatingSystem.LINUX, self.info)

		assert self.info.overall_status == GPUDriverStatusStates.READY
		assert self.info.message == GPUInfo.nvidia_ready()
		assert self.info.cuda_runtime_version == '11.8'

	@patch('app.features.hardware.nvidia_detector.torch')
	@patch('app.features.hardware.nvidia_detector.device_service')
	def test_detect_cuda_gpus_sets_cuda_runtime_version(self, mock_device_service, mock_torch):
		"""Test _detect_cuda_gpus() extracts CUDA runtime version."""
		mock_device_service.device_count = 0
		mock_version = MagicMock()
		mock_version.cuda = '12.1'
		mock_torch.version = mock_version

		with patch.object(self.detector, '_get_driver_version', return_value=None):
			self.detector._detect_cuda_gpus(OperatingSystem.LINUX, self.info)

		assert self.info.cuda_runtime_version == '12.1'

	@patch('app.features.hardware.nvidia_detector.device_service')
	def test_collect_gpu_devices_returns_device_list(self, mock_device_service):
		"""Test _collect_gpu_devices() returns list of GPU devices."""
		mock_device_service.device_count = 2
		mock_device_service.current_device = 0

		mock_device_service.get_device_name.side_effect = ['NVIDIA RTX 3090', 'NVIDIA RTX 4090']

		mock_prop1 = MagicMock()
		mock_prop1.total_memory = 24 * 1024 * 1024 * 1024
		mock_prop1.major = 8
		mock_prop1.minor = 6

		mock_prop2 = MagicMock()
		mock_prop2.total_memory = 24 * 1024 * 1024 * 1024
		mock_prop2.major = 8
		mock_prop2.minor = 9

		mock_device_service.get_device_properties.side_effect = [mock_prop1, mock_prop2]

		gpus = self.detector._collect_gpu_devices()

		assert len(gpus) == 2
		assert gpus[0].name == 'NVIDIA RTX 3090'
		assert gpus[0].is_primary is True
		assert gpus[0].cuda_compute_capability == '8.6'
		assert gpus[1].name == 'NVIDIA RTX 4090'
		assert gpus[1].is_primary is False
		assert gpus[1].cuda_compute_capability == '8.9'

	@patch('app.features.hardware.nvidia_detector.device_service')
	def test_collect_gpu_devices_skips_none_properties(self, mock_device_service):
		"""Test _collect_gpu_devices() skips devices with None properties."""
		mock_device_service.device_count = 2
		mock_device_service.current_device = 0
		mock_device_service.get_device_name.side_effect = ['GPU 1', 'GPU 2']
		mock_device_service.get_device_properties.side_effect = [None, None]

		gpus = self.detector._collect_gpu_devices()

		assert len(gpus) == 0

	@patch('app.features.hardware.nvidia_detector.subprocess')
	def test_get_driver_version_success(self, mock_subprocess):
		"""Test _get_driver_version() returns version on success."""
		mock_result = MagicMock()
		mock_result.stdout = '525.60.11\n'
		mock_subprocess.run.return_value = mock_result

		version = self.detector._get_driver_version(OperatingSystem.LINUX)

		assert version == '525.60.11'

	@patch('app.features.hardware.nvidia_detector.subprocess.run')
	def test_get_driver_version_failure(self, mock_subprocess_run):
		"""Test _get_driver_version() returns None on failure."""
		mock_subprocess_run.side_effect = FileNotFoundError()

		version = self.detector._get_driver_version(OperatingSystem.LINUX)

		assert version is None

	def test_handle_no_cuda_on_linux(self):
		"""Test _handle_no_cuda() on Linux sets up NVIDIA troubleshooting."""
		with patch.object(self.detector, '_setup_nvidia_troubleshooting') as mock_setup:
			self.detector._handle_no_cuda(OperatingSystem.LINUX, self.info)

			assert self.info.overall_status == GPUDriverStatusStates.NO_GPU
			mock_setup.assert_called_once_with(OperatingSystem.LINUX, self.info)

	def test_handle_no_cuda_on_macos(self):
		"""Test _handle_no_cuda() on macOS sets macOS message."""
		self.detector._handle_no_cuda(OperatingSystem.DARWIN, self.info)

		assert self.info.overall_status == GPUDriverStatusStates.NO_GPU
		assert self.info.message == GPUInfo.macos_no_acceleration()

	@patch('app.features.hardware.nvidia_detector.subprocess.run')
	def test_setup_nvidia_troubleshooting(self, mock_subprocess_run):
		"""Test _setup_nvidia_troubleshooting() sets up troubleshooting info."""
		mock_subprocess_run.side_effect = FileNotFoundError()

		self.detector._setup_nvidia_troubleshooting(OperatingSystem.LINUX, self.info)

		assert self.info.message == GPUInfo.nvidia_no_gpu()
		assert self.info.recommendation_link == GPUInfo.nvidia_recommendation_link()
		assert self.info.troubleshooting_steps == GPUInfo.nvidia_troubleshooting_steps()

	@patch('app.features.hardware.nvidia_detector.subprocess.run')
	def test_setup_nvidia_troubleshooting_with_driver_issue(self, mock_subprocess_run):
		"""Test _setup_nvidia_troubleshooting() detects driver issue."""
		mock_subprocess_run.return_value = MagicMock()

		self.detector._setup_nvidia_troubleshooting(OperatingSystem.LINUX, self.info)

		assert self.info.overall_status == GPUDriverStatusStates.DRIVER_ISSUE
		assert self.info.message == GPUInfo.nvidia_driver_issue()
		assert self.info.troubleshooting_steps is not None
		assert GPUInfo.nvidia_driver_status_step() in self.info.troubleshooting_steps

	@patch('app.features.hardware.nvidia_detector.subprocess.run')
	def test_check_nvidia_smi_available_success(self, mock_subprocess_run):
		"""Test _check_nvidia_smi_available() returns True when available."""
		mock_subprocess_run.return_value = MagicMock()

		result = self.detector._check_nvidia_smi_available(OperatingSystem.LINUX)

		assert result is True

	@patch('app.features.hardware.nvidia_detector.subprocess.run')
	def test_check_nvidia_smi_available_failure(self, mock_subprocess_run):
		"""Test _check_nvidia_smi_available() returns False when unavailable."""
		mock_subprocess_run.side_effect = FileNotFoundError()

		result = self.detector._check_nvidia_smi_available(OperatingSystem.LINUX)

		assert result is False
