"""Hires fix processor for high-resolution image generation."""

import torch
from PIL import Image

from app.constants.upscalers import REALESRGAN_UPSCALERS
from app.cores.upscalers.realesrgan import realesrgan_upscaler
from app.cores.upscalers.traditional import traditional_upscaler
from app.schemas.hires_fix import HiresFixRequest
from app.schemas.model_loader import DiffusersPipeline
from app.services import logger_service

logger = logger_service.get_logger(__name__, category='HiresFix')


class HiresFixProcessor:
	"""Orchestrates high-resolution fix for image generation.

	Routes to appropriate upscaler based on type:
	- AI upscalers (Real-ESRGAN): upscale only, no refinement needed
	- Traditional upscalers (Lanczos, etc.): upscale + img2img refinement
	"""

	def apply(
		self,
		request: HiresFixRequest,
		pipe: DiffusersPipeline,
		generator: torch.Generator,
		images: list[Image.Image],
	) -> list[Image.Image]:
		"""Apply hires fix to decoded base images.

		Args:
			request: Hires fix request (final prompts + hires config)
			pipe: Diffusion pipeline
			images: Decoded base PIL images
			generator: Torch generator for reproducibility

		Returns:
			Upscaled (and optionally refined) PIL images at higher resolution
		"""
		hires_config = request.hires_fix
		result: list[Image.Image] = []

		logger.info(f'Applying hires fix\n{logger_service.format_config(hires_config)}')

		if hires_config.upscaler in REALESRGAN_UPSCALERS:
			result = realesrgan_upscaler.upscale(
				images,
				hires_config.upscaler,
				hires_config.upscale_factor,
			)
		else:
			result = traditional_upscaler.upscale(
				request,
				pipe,
				generator,
				images,
			)

		logger.info('Hires fix completed')
		return result


hires_fix_processor = HiresFixProcessor()
