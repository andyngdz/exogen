"""NVIDIA GPU detection for Windows and Linux systems."""

import subprocess
import sys
from typing import Optional

import torch

from app.constants.platform import OperatingSystem
from app.schemas.hardware import GPUDeviceInfo, GPUDriverInfo, GPUDriverStatusStates
from app.services import device_service, logger_service

from .info import GPUInfo

logger = logger_service.get_logger(__name__, category='Hardware')

if sys.platform == 'win32':
	CREATE_NO_WINDOW = subprocess.CREATE_NO_WINDOW
else:
	CREATE_NO_WINDOW = 0


class NvidiaDetector:
	"""NVIDIA GPU detection for Windows/Linux."""

	def detect(self, system_os: OperatingSystem, info: GPUDriverInfo) -> None:
		"""Detect NVIDIA GPU and update info.

		Args:
			system_os: Operating system enum value
			info: GPUDriverInfo object to update
		"""
		if device_service.is_cuda:
			self._detect_cuda_gpus(system_os, info)
		else:
			self._handle_no_cuda(system_os, info)

	def _detect_cuda_gpus(self, system_os: OperatingSystem, info: GPUDriverInfo) -> None:
		"""Detect CUDA-enabled GPUs and populate info.

		Args:
			system_os: Operating system name
			info: GPUDriverInfo object to update
		"""
		info.overall_status = GPUDriverStatusStates.READY
		info.message = GPUInfo.nvidia_ready()
		version = getattr(torch, 'version', None)
		info.cuda_runtime_version = getattr(version, 'cuda', None)

		# Collect GPU device information
		info.gpus = self._collect_gpu_devices()

		# Try to get driver version from nvidia-smi
		driver_version = self._get_driver_version(system_os)
		if driver_version:
			info.nvidia_driver_version = driver_version
		else:
			info.message += GPUInfo.nvidia_smi_warning()

	def _collect_gpu_devices(self) -> list[GPUDeviceInfo]:
		"""Enumerate all CUDA devices.

		Returns:
			List of GPUDeviceInfo objects for each detected GPU
		"""
		gpus = []
		device_count = device_service.device_count

		for index in range(device_count):
			name = device_service.get_device_name(index)
			device_property = device_service.get_device_properties(index)

			if device_property is None:
				logger.warning(f'Could not retrieve properties for device index {index}. Skipping.')
				continue

			total_memory = device_property.total_memory
			cuda_compute_capability = f'{device_property.major}.{device_property.minor}'
			is_primary = index == device_service.current_device

			gpus.append(
				GPUDeviceInfo(
					name=name,
					memory=total_memory,
					cuda_compute_capability=cuda_compute_capability,
					is_primary=is_primary,
				)
			)

		return gpus

	def _get_driver_version(self, system_os: OperatingSystem) -> Optional[str]:
		"""Query nvidia-smi for driver version.

		Args:
			system_os: Operating system enum value

		Returns:
			Driver version string or None if unavailable
		"""
		try:
			result = subprocess.run(
				[
					'nvidia-smi',
					'--query-gpu=driver_version',
					'--format=csv,noheader',
				],
				capture_output=True,
				text=True,
				check=True,
				creationflags=(CREATE_NO_WINDOW if system_os == OperatingSystem.WINDOWS else 0),
			)
			driver_version = result.stdout.strip().split('\n')[0]
			return driver_version
		except (subprocess.CalledProcessError, FileNotFoundError) as error:
			logger.warning(f'nvidia-smi not found or failed: {error}. Cannot get detailed driver version.')
			return None

	def _handle_no_cuda(self, system_os: OperatingSystem, info: GPUDriverInfo) -> None:
		"""Handle case when CUDA is not available.

		Args:
			system_os: Operating system enum value
			info: GPUDriverInfo object to update
		"""
		info.overall_status = GPUDriverStatusStates.NO_GPU

		# Only show NVIDIA troubleshooting steps for non-macOS systems
		# macOS does not support NVIDIA CUDA
		if system_os != OperatingSystem.DARWIN:
			self._setup_nvidia_troubleshooting(system_os, info)
		else:
			# macOS doesn't support NVIDIA CUDA
			info.message = GPUInfo.macos_no_acceleration()

	def _setup_nvidia_troubleshooting(self, system_os: OperatingSystem, info: GPUDriverInfo) -> None:
		"""Setup NVIDIA troubleshooting information.

		Args:
			system_os: Operating system enum value
			info: GPUDriverInfo object to update
		"""
		info.message = GPUInfo.nvidia_no_gpu()
		info.recommendation_link = GPUInfo.nvidia_recommendation_link()
		info.troubleshooting_steps = GPUInfo.nvidia_troubleshooting_steps()

		# Check if nvidia-smi is available to determine if it's a driver issue
		if self._check_nvidia_smi_available(system_os):
			info.overall_status = GPUDriverStatusStates.DRIVER_ISSUE
			info.message = GPUInfo.nvidia_driver_issue()
			info.troubleshooting_steps.insert(0, GPUInfo.nvidia_driver_status_step())

	def _check_nvidia_smi_available(self, system_os: OperatingSystem) -> bool:
		"""Check if nvidia-smi is available.

		Args:
			system_os: Operating system enum value

		Returns:
			True if nvidia-smi is available, False otherwise
		"""
		try:
			subprocess.run(
				['nvidia-smi'],
				capture_output=True,
				text=True,
				check=True,
				creationflags=(CREATE_NO_WINDOW if system_os == OperatingSystem.WINDOWS else 0),
			)
			return True
		except (subprocess.CalledProcessError, FileNotFoundError):
			return False
