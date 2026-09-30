"""Service for image-to-image generation."""

from concurrent.futures import ThreadPoolExecutor

import torch
from sqlalchemy.orm import Session

from app.cores.generation.lora_loader import lora_loader
from app.cores.generation.prompt_processor import prompt_processor
from app.cores.generation.resource_manager import resource_manager
from app.cores.generation.response_builder import response_builder
from app.cores.model_manager import model_manager
from app.features.img2img.base_img2img import BaseImg2Img
from app.features.img2img.config_validator import config_validator
from app.schemas.img2img import ImageGenerationResponse, Img2ImgConfig
from app.services import image_service, logger_service

logger = logger_service.get_logger(__name__, category='Generate')


class Img2ImgService:
	"""Service for image-to-image generation.

	Orchestrates the img2img generation process by coordinating between:
	- Configuration validation
	- LoRA loading
	- Prompt processing
	- Image preprocessing
	- Pipeline execution
	- Resource cleanup
	"""

	def __init__(self):
		self.executor = ThreadPoolExecutor()
		self.generator = BaseImg2Img(self.executor)

	async def generate_image_from_image(self, config: Img2ImgConfig, db: Session) -> ImageGenerationResponse:
		"""Generate images from an input image using img2img pipeline.

		Args:
			config: Img2img configuration with source image and parameters.
			db: Database session for loading LoRA information.

		Returns:
			ImageGenerationResponse with generated images.

		Raises:
			ValueError: If model not loaded or generation fails.
		"""
		logger.info(f'Received img2img request: prompt="{config.prompt}", strength={config.strength}')

		# Validate model is loaded
		if not model_manager.has_model:
			raise ValueError('No model is currently loaded')

		# Step 1: Validate configuration
		config_validator.validate_config(config)

		# Step 2: Prepare resources for generation
		resource_manager.prepare_for_generation()

		# Step 3: Load LoRAs if specified
		lora_loader.load_loras_for_generation(config, db)

		try:
			# Step 4: Process prompts with styles
			positive_prompt, negative_prompt = prompt_processor.prepare_prompts(config)

			# Step 5: Decode and preprocess source image
			init_image = image_service.from_base64(config.init_image)
			logger.info(f'Source image size: {init_image.size}')

			init_image = image_service.resize_image(init_image, config.width, config.height, config.resize_mode)
			logger.info(f'Resized source image to: {init_image.size}')

			# Step 6: Execute pipeline
			output = await self.generator.execute_pipeline(config, positive_prompt, negative_prompt, init_image)

			# Step 7: Build response from output
			response = response_builder.build_response(output)

			# Cleanup output object
			del output

			return response

		except FileNotFoundError as error:
			logger.error(f'Model directory not found: {error}')
			raise ValueError(f'Required files not found: {error}') from error

		except torch.cuda.OutOfMemoryError as error:
			resource_manager.handle_oom_error()

			raise ValueError(
				f'Out of memory: {config.number_of_images} images at {config.width}x{config.height}. '
				f'Try: (1) Reduce to 1 image, (2) Lower resolution to 512x512, (3) Reduce strength, '
				f'or (4) Restart model.'
			) from error

		except Exception as error:
			logger.exception(f'Failed img2img for prompt: "{config.prompt}"')
			raise ValueError(f'Failed to generate img2img: {error}') from error

		finally:
			# Step 8: Cleanup resources
			lora_loader.unload_loras()
			resource_manager.cleanup_after_generation()


img2img_service = Img2ImgService()
