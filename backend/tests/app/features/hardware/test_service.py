"""Tests for hardware service (read-only GPU detection)."""

from unittest.mock import patch

from app.features.hardware.info import GPUInfo
from app.features.hardware.service import HardwareService
from app.schemas.hardware import (
	AcceleratorMemoryDevice,
	AcceleratorMemoryInfo,
	GPUDriverInfo,
	GPUDriverStatusStates,
)


class TestHardwareService:
	"""Test hardware service orchestration."""

	def setup_method(self):
		"""Set up test fixtures."""
		self.service = HardwareService()

	def test_init_creates_gpu_detector(self):
		"""Test __init__ creates GPU detector."""
		assert self.service.gpu_detector is not None

	def test_get_gpu_info_calls_detector(self):
		"""Test get_gpu_info() calls GPU detector."""
		mock_info = GPUDriverInfo(
			gpus=[],
			is_cuda=True,
			message=GPUInfo.nvidia_ready(),
			overall_status=GPUDriverStatusStates.READY,
		)

		with patch.object(self.service.gpu_detector, 'detect', return_value=mock_info) as mock_detect:
			result = self.service.get_gpu_info()

			assert result == mock_info
			mock_detect.assert_called_once()

	def test_recheck_gpu_info_clears_cache_and_detects(self):
		"""Test recheck_gpu_info() clears cache before detecting."""
		mock_info = GPUDriverInfo(
			gpus=[],
			is_cuda=True,
			message=GPUInfo.nvidia_ready(),
			overall_status=GPUDriverStatusStates.READY,
		)

		with patch.object(self.service.gpu_detector, 'clear_cache') as mock_clear:
			with patch.object(self.service.gpu_detector, 'detect', return_value=mock_info) as mock_detect:
				result = self.service.recheck_gpu_info()

				mock_clear.assert_called_once()
				mock_detect.assert_called_once()
				assert result == mock_info


class TestHardwareMemoryUsage:
	"""Test accelerator memory readings for each device branch."""

	def setup_method(self):
		"""Set up test fixtures."""
		self.service = HardwareService()

	@patch('app.features.hardware.service.torch')
	@patch('app.features.hardware.service.device_service')
	def test_cuda_reports_used_as_total_minus_free(self, mock_device_service, mock_torch):
		"""CUDA reads mem_get_info on the current device."""
		mock_device_service.is_cuda = True
		mock_device_service.is_mps = False
		mock_device_service.current_device = 1
		mock_torch.cuda.mem_get_info.return_value = (3 * 1024**3, 12 * 1024**3)

		result = self.service.get_memory_usage()

		assert result == AcceleratorMemoryInfo(
			device=AcceleratorMemoryDevice.CUDA, used_bytes=9 * 1024**3, total_bytes=12 * 1024**3
		)
		mock_torch.cuda.mem_get_info.assert_called_once_with(1)

	@patch('app.features.hardware.service.torch')
	@patch('app.features.hardware.service.device_service')
	def test_mps_reports_allocated_and_recommended_max(self, mock_device_service, mock_torch):
		"""MPS reads the allocated and recommended maximum memory."""
		mock_device_service.is_cuda = False
		mock_device_service.is_mps = True
		mock_torch.mps.current_allocated_memory.return_value = 2 * 1024**3
		mock_torch.mps.recommended_max_memory.return_value = 16 * 1024**3

		result = self.service.get_memory_usage()

		assert result == AcceleratorMemoryInfo(
			device=AcceleratorMemoryDevice.MPS, used_bytes=2 * 1024**3, total_bytes=16 * 1024**3
		)

	@patch('app.features.hardware.service.device_service')
	def test_cpu_reports_zeros(self, mock_device_service):
		"""CPU has no accelerator memory to report."""
		mock_device_service.is_cuda = False
		mock_device_service.is_mps = False

		result = self.service.get_memory_usage()

		assert result == AcceleratorMemoryInfo(device=AcceleratorMemoryDevice.CPU, used_bytes=0, total_bytes=0)
