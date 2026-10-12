"""Integration tests for hardware API endpoints and detection logic."""

from unittest.mock import patch

from app.features.hardware.info import GPUInfo
from app.schemas.hardware import (
	AcceleratorMemoryDevice,
	AcceleratorMemoryInfo,
	GPUDriverInfo,
	GPUDriverStatusStates,
)


class TestHardwareEndpoints:
	"""Test hardware API endpoints (read-only GPU detection)."""

	@patch('app.features.hardware.service.hardware_service.get_gpu_info')
	def test_get_hardware_endpoint(self, mock_get_gpu_info):
		"""Test GET /hardware/ endpoint returns GPU info."""
		from app.features.hardware.api import get_hardware

		mock_info = GPUDriverInfo(
			gpus=[],
			is_cuda=False,
			message=GPUInfo.default_detecting(),
			overall_status=GPUDriverStatusStates.UNKNOWN_ERROR,
		)
		mock_get_gpu_info.return_value = mock_info

		result = get_hardware()

		assert result == mock_info
		mock_get_gpu_info.assert_called_once()

	@patch('app.features.hardware.service.hardware_service.recheck_gpu_info')
	def test_recheck_endpoint(self, mock_recheck_gpu_info):
		"""Test GET /hardware/recheck re-detects GPU."""
		from app.features.hardware.api import recheck

		mock_info = GPUDriverInfo(
			gpus=[],
			is_cuda=True,
			message=GPUInfo.nvidia_ready(),
			overall_status=GPUDriverStatusStates.READY,
		)
		mock_recheck_gpu_info.return_value = mock_info

		result = recheck()

		assert result == mock_info
		mock_recheck_gpu_info.assert_called_once()

	@patch('app.features.hardware.service.hardware_service.get_memory_usage')
	def test_memory_endpoint(self, mock_get_memory_usage):
		"""Test GET /hardware/memory returns the service reading."""
		from app.features.hardware.api import get_memory

		mock_info = AcceleratorMemoryInfo(device=AcceleratorMemoryDevice.CUDA, used_bytes=1, total_bytes=2)
		mock_get_memory_usage.return_value = mock_info

		result = get_memory()

		assert result == mock_info
		mock_get_memory_usage.assert_called_once()
