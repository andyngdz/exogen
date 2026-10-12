"""Img2img refinement for traditional upscaling."""

from typing import cast

import torch
from diffusers.pipelines.stable_diffusion.pipeline_output import StableDiffusionPipelineOutput
from PIL import Image

from app.schemas.generators import Img2ImgParams, OutputType
from app.schemas.hires_fix import HiresFixRequest
from app.schemas.model_loader import DiffusersPipeline
from app.services import logger_service

logger = logger_service.get_logger(__name__, category='Upscaler')


class Img2ImgRefiner:
	"""Handles img2img refinement pass to add detail after upscaling."""

	def refine(
		self,
		request: HiresFixRequest,
		pipe: DiffusersPipeline,
		generator: torch.Generator,
		images: list[Image.Image],
		steps: int,
		denoising_strength: float,
	) -> list[Image.Image]:
		"""Run img2img refinement pass to add detail and reduce upscaling blur.

		Args:
			request: Hires fix request (final prompts + config)
			pipe: Diffusion pipeline
			generator: Torch generator for reproducibility
			images: Upscaled PIL images
			steps: Number of inference steps
			denoising_strength: How much to repaint (0=keep original, 1=fully repaint)

		Returns:
			Refined PIL images
		"""
		batch_size = len(images)
		width, height = images[0].size

		params = Img2ImgParams(
			prompt=request.prompt,
			negative_prompt=request.negative_prompt,
			num_inference_steps=steps,
			guidance_scale=request.cfg_scale,
			generator=generator,
			clip_skip=request.clip_skip,
			output_type=OutputType.PIL,
			strength=denoising_strength,
			num_images_per_prompt=batch_size,
			height=height,
			width=width,
			image=images,
		)

		logger.info(f'Img2Img refinement\n{logger_service.format_config(params)}')

		output = cast(StableDiffusionPipelineOutput, pipe(**vars(params)))
		return output.images


img2img_refiner = Img2ImgRefiner()
