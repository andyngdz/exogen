"""Integration tests for hardware API endpoints and detection logic."""

from unittest.mock import patch

from app.features.hardware.info import GPUInfo
from app.schemas.hardware import GPUDriverInfo, GPUDriverStatusStates


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
