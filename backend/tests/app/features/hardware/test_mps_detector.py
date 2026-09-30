"""Tests for Apple Silicon MPS detector."""

from unittest.mock import patch

from app.features.hardware.info import GPUInfo
from app.features.hardware.mps_detector import MPSDetector
from app.schemas.hardware import GPUDriverInfo, GPUDriverStatusStates


class TestMPSDetector:
	"""Test MPS GPU detection logic."""

	def setup_method(self):
		"""Set up test fixtures."""
		self.detector = MPSDetector()
		self.info = GPUDriverInfo(
			gpus=[],
			is_cuda=False,
			message='',
			overall_status=GPUDriverStatusStates.UNKNOWN_ERROR,
		)

	@patch('app.features.hardware.mps_detector.platform')
	def test_detect_sets_ready_status(self, mock_platform):
		"""Test detect() sets READY status."""
		mock_platform.machine.return_value = 'arm64'

		self.detector.detect(self.info)

		assert self.info.overall_status == GPUDriverStatusStates.READY

	@patch('app.features.hardware.mps_detector.platform')
	def test_detect_sets_mps_message(self, mock_platform):
		"""Test detect() sets correct MPS message."""
		mock_platform.machine.return_value = 'arm64'

		self.detector.detect(self.info)

		assert self.info.message == GPUInfo.macos_mps_ready()

	@patch('app.features.hardware.mps_detector.platform')
	def test_detect_sets_mps_available_true(self, mock_platform):
		"""Test detect() sets MPS available flag to True."""
		mock_platform.machine.return_value = 'arm64'

		self.detector.detect(self.info)

		assert self.info.macos_mps_available is True

	@patch('app.features.hardware.mps_detector.platform')
	def test_detect_adds_gpu_device(self, mock_platform):
		"""Test detect() adds GPU device to list."""
		mock_platform.machine.return_value = 'arm64'

		self.detector.detect(self.info)

		assert len(self.info.gpus) == 1
		assert self.info.gpus[0].name == 'arm64'
		assert self.info.gpus[0].is_primary is True

	def test_handle_no_mps_sets_no_gpu_status(self):
		"""Test handle_no_mps() sets NO_GPU status."""
		self.detector.handle_no_mps(self.info)

		assert self.info.overall_status == GPUDriverStatusStates.NO_GPU

	def test_handle_no_mps_sets_message(self):
		"""Test handle_no_mps() sets correct message."""
		self.detector.handle_no_mps(self.info)

		assert self.info.message == GPUInfo.macos_no_acceleration()

	def test_handle_no_mps_sets_mps_available_false(self):
		"""Test handle_no_mps() sets MPS available flag to False."""
		self.detector.handle_no_mps(self.info)

		assert self.info.macos_mps_available is False

	def test_handle_no_mps_sets_troubleshooting_steps(self):
		"""Test handle_no_mps() sets troubleshooting steps."""
		self.detector.handle_no_mps(self.info)

		assert self.info.troubleshooting_steps is not None
		assert self.info.troubleshooting_steps == GPUInfo.macos_troubleshooting_steps()
		assert len(self.info.troubleshooting_steps) > 0
