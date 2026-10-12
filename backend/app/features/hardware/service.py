"""Hardware service for GPU detection (read-only)."""

import torch

from app.schemas.hardware import AcceleratorMemoryDevice, AcceleratorMemoryInfo, GPUDriverInfo
from app.services import device_service, logger_service

from .gpu_detector import GPUDetector

logger = logger_service.get_logger(__name__, category='Hardware')


class HardwareService:
	"""Orchestrates hardware detection.

	This service manages:
	- GPU detection and information
	"""

	def __init__(self):
		self.gpu_detector = GPUDetector()

	def get_gpu_info(self) -> GPUDriverInfo:
		"""Get cached GPU information.

		Returns:
			GPUDriverInfo with detected hardware information
		"""
		return self.gpu_detector.detect()

	def recheck_gpu_info(self) -> GPUDriverInfo:
		"""Force re-detection of GPU.

		Returns:
			GPUDriverInfo with freshly detected hardware information
		"""
		self.gpu_detector.clear_cache()
		logger.info('Forcing re-check of GPU driver status by clearing cache.')
		return self.gpu_detector.detect()

	def get_memory_usage(self) -> AcceleratorMemoryInfo:
		"""Read memory in use on the active accelerator.

		Returns:
			AcceleratorMemoryInfo for CUDA or MPS, or zeros on CPU
		"""
		if device_service.is_cuda:
			free_bytes, total_bytes = torch.cuda.mem_get_info(device_service.current_device)
			return AcceleratorMemoryInfo(
				device=AcceleratorMemoryDevice.CUDA,
				used_bytes=total_bytes - free_bytes,
				total_bytes=total_bytes,
			)

		if device_service.is_mps:
			return AcceleratorMemoryInfo(
				device=AcceleratorMemoryDevice.MPS,
				used_bytes=torch.mps.current_allocated_memory(),
				total_bytes=torch.mps.recommended_max_memory(),
			)

		return AcceleratorMemoryInfo(device=AcceleratorMemoryDevice.CPU, used_bytes=0, total_bytes=0)


hardware_service = HardwareService()
