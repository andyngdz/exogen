"""Progress callback handler for step-by-step generation updates."""

from app.constants.generation import CACHE_CLEAR_INTERVAL
from app.cores.generation.image_processor import image_processor
from app.cores.gpu_utils import clear_device_cache
from app.schemas.generators import ImageGenerationStepEndResponse
from app.schemas.model_loader import DiffusersPipeline
from app.services import image_service, logger_service
from app.socket import socket_service

logger = logger_service.get_logger(__name__, category='Generate')


class ProgressCallback:
	"""Handles step-by-step progress callbacks via WebSocket."""

	def __init__(self):
		self.image_processor = image_processor
		self.step_count = 0  # Track steps for periodic cleanup

	def reset(self):
		"""Reset the callback state for a new generation."""
		self.step_count = 0
		# Clear any cached tensors in image processor
		self.image_processor.clear_tensor_cache()

	def callback_on_step_end(
		self, _pipe: DiffusersPipeline, current_step: int, timestep: float, callback_kwargs: dict
	) -> dict:
		"""Callback for step-by-step progress updates via WebSocket with memory cleanup.

		Args:
			_pipe: The diffusion pipeline instance (unused but required by diffusers API).
			current_step: Current inference step number.
			timestep: Current timestep value.
			callback_kwargs: Dictionary containing latents and other callback data.

		Returns:
			The callback_kwargs dictionary (required by diffusers API).
		"""
		logger.info(f'Callback on step end: current_step={current_step}, timestep={timestep}')

		latents = callback_kwargs['latents']

		for index, latent in enumerate(latents):
			# Generate preview image
			image = self.image_processor.latents_to_rgb(latent)

			# Convert to base64 for websocket transmission
			image_base64 = image_service.to_base64(image)

			logger.info(f'Generated preview for step {current_step}, index {index}')

			# Send via websocket
			socket_service.image_generation_step_end(
				ImageGenerationStepEndResponse(
					current_step=current_step,
					image_base64=image_base64,
					index=index,
					timestep=timestep,
				)
			)

			# Explicitly delete the preview image to free RAM
			# The base64 string will be garbage collected after websocket send
			del image
			del image_base64

		# Increment step counter
		self.step_count += 1

		# Periodically clear CUDA cache to prevent memory buildup during generation
		# Clears every N steps (configured via CACHE_CLEAR_INTERVAL constant)
		# This ensures cache is cleared even in short generations (e.g., 4 steps = 1 clear at step 3)
		if self.step_count % CACHE_CLEAR_INTERVAL == 0:
			reason = f'Progress callback step {current_step}'
			clear_device_cache(reason=reason)

		return callback_kwargs


progress_callback = ProgressCallback()
