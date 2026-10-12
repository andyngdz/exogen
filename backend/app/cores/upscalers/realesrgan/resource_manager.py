"""Resource management for Real-ESRGAN models."""

from typing import Optional

from realesrgan import RealESRGANer

from app.cores.model_manager.resource_manager import resource_manager
from app.services import logger_service

logger = logger_service.get_logger(__name__, category='Upscaler')


class RealESRGANResourceManager:
	"""Manages cleanup and memory for Real-ESRGAN models."""

	def cleanup(self, model: Optional[RealESRGANer]) -> None:
		"""Clean up model and free GPU memory."""
		resource_manager.cleanup_pipeline(model, 'Real-ESRGAN')


realesrgan_resource_manager = RealESRGANResourceManager()
