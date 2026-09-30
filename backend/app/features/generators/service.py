"""Service for text-to-image generation."""

from concurrent.futures import ThreadPoolExecutor

import torch
from sqlalchemy.orm import Session

from app.cores.generation.lora_loader import lora_loader
from app.cores.generation.prompt_processor import prompt_processor
from app.cores.generation.resource_manager import resource_manager
from app.cores.generation.response_builder import response_builder
from app.cores.model_manager import model_manager
from app.features.generators.base_generator import BaseGenerator
from app.features.generators.config_validator import config_validator
from app.schemas.generators import GeneratorConfig, ImageGenerationResponse
from app.services import logger_service

logger = logger_service.get_logger(__name__, category='Generate')


class GeneratorService:
	"""Service for text-to-image generation.

	Orchestrates the image generation process by coordinating between:
	- Configuration validation
	- LoRA loading
	- Prompt processing
	- Pipeline execution
	- Resource cleanup
	"""

	def __init__(self):
		self.executor = ThreadPoolExecutor()
		self.generator = BaseGenerator(self.executor)

	async def generate_image(self, config: GeneratorConfig, db: Session) -> ImageGenerationResponse:
		"""Generate images from text prompts using text-to-image pipeline.

		Args:
			config: Generation configuration with prompt and parameters
			db: Database session for loading LoRA information

		Returns:
			ImageGenerationResponse with generated images

		Raises:
			ValueError: If model not loaded or generation fails
		"""
		logger.info(f'Received image generation request: {config}')

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

			# Step 5: Execute pipeline
			output = await self.generator.execute_pipeline(config, positive_prompt, negative_prompt)

			# Step 6: Build response from output
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
				f'Out of memory error: tried to allocate memory but GPU is full. '
				f'Current batch: {config.number_of_images} images at {config.width}x{config.height}. '
				f'Try: (1) Reduce number of images to 1-2, (2) Lower resolution to 512x512, '
				f'or (3) Restart the model to clear memory.'
			) from error

		except Exception as error:
			logger.exception(f'Failed to generate image for prompt: "{config.prompt}"')
			raise ValueError(f'Failed to generate image: {error}') from error

		finally:
			# Step 7: Cleanup resources
			lora_loader.unload_loras()
			resource_manager.cleanup_after_generation()


generator_service = GeneratorService()
