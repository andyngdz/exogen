"""Hardware service for GPU detection (read-only)."""

from app.schemas.hardware import GPUDriverInfo
from app.services import logger_service

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


hardware_service = HardwareService()
