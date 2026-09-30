"""Resource management and cleanup shared by generation features."""

from app.cores.generation import image_processor, memory_manager, progress_callback
from app.services import logger_service

logger = logger_service.get_logger(__name__, category='Generate')


class ResourceManager:
	"""Manages resource cleanup and cache clearing."""

	def prepare_for_generation(self) -> None:
		"""Prepare resources before generation starts.

		Clears caches and resets progress tracking.
		"""
		memory_manager.clear_cache()
		progress_callback.reset()

	def cleanup_after_generation(self) -> None:
		"""Clean up resources after generation completes or fails.

		Clears GPU cache and resets progress tracking state.
		"""
		memory_manager.clear_cache()
		progress_callback.reset()

	def handle_oom_error(self) -> None:
		"""Handle out-of-memory errors by clearing caches."""
		logger.error('Out of memory error during image generation - clearing all caches to recover')
		memory_manager.clear_cache()
		image_processor.clear_tensor_cache()


resource_manager = ResourceManager()
