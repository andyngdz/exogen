"""Configuration validation for image generation."""

from app.cores.generation import memory_manager
from app.schemas.generators import GeneratorConfig


class ConfigValidator:
	"""Validates generation configuration before execution."""

	def validate_config(self, config: GeneratorConfig) -> None:
		"""Validate generation configuration.

		Args:
			config: Generation configuration to validate

		Raises:
			ValueError: If configuration is invalid
		"""
		# Validate batch size to prevent OOM errors
		memory_manager.validate_batch_size(
			config.number_of_images,
			config.width,
			config.height,
		)


config_validator = ConfigValidator()
