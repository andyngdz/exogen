"""Core image-to-image generation logic."""

import asyncio
from concurrent.futures import ThreadPoolExecutor

import torch
from diffusers.pipelines.stable_diffusion.pipeline_output import StableDiffusionPipelineOutput
from PIL import Image

from app.cores.generation import progress_callback, seed_manager
from app.cores.generation.hires_fix_utils import apply_hires_fix_common
from app.cores.generation.phase_tracker import Img2ImgPhaseTracker
from app.cores.generation.safety_checker_service import safety_checker_service
from app.cores.model_manager import model_manager
from app.cores.pipeline_converter import pipeline_converter
from app.schemas.img2img import Img2ImgConfig
from app.services import logger_service

logger = logger_service.get_logger(__name__, category='Generate')


class BaseImg2Img:
	"""Handles core pipeline execution for image-to-image generation."""

	def __init__(self, executor: ThreadPoolExecutor):
		"""Initialize generator with thread executor.

		Args:
			executor: ThreadPoolExecutor for async operations
		"""
		self.executor = executor

	async def execute_pipeline(
		self,
		config: Img2ImgConfig,
		positive_prompt: str,
		negative_prompt: str,
		init_image: Image.Image,
	) -> StableDiffusionPipelineOutput:
		"""Execute the diffusion pipeline for image-to-image generation.

		Args:
			config: Img2Img configuration
			positive_prompt: Processed positive prompt
			negative_prompt: Processed negative prompt
			init_image: Preprocessed source image

		Returns:
			Pipeline output with generated images

		Raises:
			ValueError: If generation fails

		Note:
			Model validation is performed by Img2ImgService before this method is called.
		"""
		pipe = model_manager.pipe

		# Convert pipeline to img2img mode
		img2img_pipe = pipeline_converter.convert_to_img2img(pipe)
		model_manager.pipe = img2img_pipe

		logger.info(f"Generating img2img: '{config.prompt}'\n{logger_service.format_config(config)}")

		# Initialize phase tracker and emit start phase
		phase_tracker = Img2ImgPhaseTracker(has_hires_fix=config.hires_fix is not None)
		phase_tracker.start()

		# Set sampler
		model_manager.set_sampler(config.sampler)

		# Get seed for reproducibility
		random_seed = seed_manager.get_seed(config.seed)

		# Create generator for reproducibility
		generator = torch.Generator(device=img2img_pipe.device).manual_seed(random_seed)

		logger.info('Starting img2img generation in a separate thread.')
		loop = asyncio.get_event_loop()

		output = await loop.run_in_executor(
			self.executor,
			lambda: img2img_pipe(
				prompt=positive_prompt,
				negative_prompt=negative_prompt,
				image=init_image,
				strength=config.strength,
				num_inference_steps=config.steps,
				guidance_scale=config.cfg_scale,
				generator=generator,
				clip_skip=config.clip_skip,
				num_images_per_prompt=config.number_of_images,
				callback_on_step_end=progress_callback.callback_on_step_end,
				callback_on_step_end_tensor_inputs=['latents'],
			),
		)

		# Get images from output
		images = list(output.images)

		# Run safety checker on generated images
		images, nsfw_detected = safety_checker_service.check_images(images)

		# Apply hires fix to safe images if configured
		if config.hires_fix:
			images = await apply_hires_fix_common(
				config,
				positive_prompt,
				negative_prompt,
				img2img_pipe,
				generator,
				images,
				nsfw_detected,
				loop,
				self.executor,
				phase_tracker,
			)

		# Emit completion phase
		phase_tracker.complete()

		logger.info('Img2img generation completed successfully')

		return StableDiffusionPipelineOutput(
			images=images,
			nsfw_content_detected=nsfw_detected,
		)
