"""Configuration validation for image-to-image generation."""

from app.cores.generation import memory_manager
from app.schemas.img2img import Img2ImgConfig


class Img2ImgConfigValidator:
	"""Validates img2img configuration before execution."""

	def validate_config(self, config: Img2ImgConfig) -> None:
		"""Validate img2img configuration.

		Args:
			config: Img2img configuration to validate

		Raises:
			ValueError: If configuration is invalid
		"""
		memory_manager.validate_batch_size(
			config.number_of_images,
			config.width,
			config.height,
		)


config_validator = Img2ImgConfigValidator()
