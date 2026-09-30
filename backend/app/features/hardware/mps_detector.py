"""Apple Silicon MPS detection for macOS systems."""

import platform

from app.schemas.hardware import GPUDeviceInfo, GPUDriverInfo, GPUDriverStatusStates

from .info import GPUInfo


class MPSDetector:
	"""Apple Silicon MPS detection for macOS."""

	def detect(self, info: GPUDriverInfo) -> None:
		"""Detect MPS availability and update info.

		Args:
			info: GPUDriverInfo object to update
		"""
		info.overall_status = GPUDriverStatusStates.READY
		info.message = GPUInfo.macos_mps_ready()
		info.macos_mps_available = True
		info.gpus.append(GPUDeviceInfo(name=platform.machine(), is_primary=True))

	def handle_no_mps(self, info: GPUDriverInfo) -> None:
		"""Handle case when MPS is not available.

		Args:
			info: GPUDriverInfo object to update
		"""
		info.overall_status = GPUDriverStatusStates.NO_GPU
		info.message = GPUInfo.macos_no_acceleration()
		info.macos_mps_available = False
		info.troubleshooting_steps = GPUInfo.macos_troubleshooting_steps()
