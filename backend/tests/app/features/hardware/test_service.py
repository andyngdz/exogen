"""Tests for hardware service (read-only GPU detection)."""

from unittest.mock import patch

from app.features.hardware.info import GPUInfo
from app.features.hardware.service import HardwareService
from app.schemas.hardware import GPUDriverInfo, GPUDriverStatusStates


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
