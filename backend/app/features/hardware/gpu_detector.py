"""Main GPU detection orchestrator."""

import functools
import subprocess

import torch

from app.constants.platform import OperatingSystem
from app.schemas.hardware import GPUDriverInfo, GPUDriverStatusStates
from app.services import device_service, logger_service

from .info import GPUInfo
from .mps_detector import MPSDetector
from .nvidia_detector import NvidiaDetector

logger = logger_service.get_logger(__name__, category='Hardware')


class GPUDetector:
	"""Detects GPU and driver information based on operating system."""

	def __init__(self):
		self.nvidia_detector = NvidiaDetector()
		self.mps_detector = MPSDetector()

	@functools.cache
	def detect(self) -> GPUDriverInfo:
		"""Detect GPU and driver information.

		Returns:
			GPUDriverInfo with detected hardware information
		"""
		info = self._create_default_info()

		try:
			system_os = OperatingSystem.from_platform_system()
			backends = torch.backends

			if system_os in (OperatingSystem.WINDOWS, OperatingSystem.LINUX):
				self.nvidia_detector.detect(system_os, info)
			elif system_os == OperatingSystem.DARWIN:
				self._detect_macos_gpu(backends, info)
			else:
				info.overall_status = GPUDriverStatusStates.NO_GPU
				info.message = GPUInfo.unsupported_os(system_os.value)

		except ImportError:
			info.overall_status = GPUDriverStatusStates.UNKNOWN_ERROR
			info.message = GPUInfo.pytorch_not_installed()
			info.troubleshooting_steps = GPUInfo.pytorch_troubleshooting()
		except (subprocess.SubprocessError, OSError, AttributeError, RuntimeError) as error:
			logger.error(f'Error during GPU detection: {error}')
			info.overall_status = GPUDriverStatusStates.UNKNOWN_ERROR
			info.message = GPUInfo.unexpected_error(str(error))
			info.troubleshooting_steps = GPUInfo.error_troubleshooting_steps()

		return info

	def clear_cache(self) -> None:
		"""Clear the detection cache to force re-detection."""
		self.detect.cache_clear()

	def _create_default_info(self) -> GPUDriverInfo:
		"""Create default GPU info structure.

		Returns:
			GPUDriverInfo with default values
		"""
		return GPUDriverInfo(
			gpus=[],
			is_cuda=device_service.is_cuda,
			message=GPUInfo.default_detecting(),
			overall_status=GPUDriverStatusStates.UNKNOWN_ERROR,
		)

	def _detect_macos_gpu(self, backends, info: GPUDriverInfo) -> None:
		"""Detect GPU on macOS (MPS or CPU).

		Args:
			backends: torch.backends object
			info: GPUDriverInfo object to update
		"""
		if hasattr(backends, 'mps') and backends.mps.is_available():
			self.mps_detector.detect(info)
		else:
			self.mps_detector.handle_no_mps(info)
