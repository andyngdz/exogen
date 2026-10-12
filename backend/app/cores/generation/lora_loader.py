"""LoRA loading and management shared by generation features."""

from sqlalchemy.orm import Session

from app.cores.model_manager import model_manager
from app.database import crud as database_service
from app.schemas.loras import LoRAData, SupportsLoras
from app.services import logger_service

logger = logger_service.get_logger(__name__, category='Generate')


class LoRALoader:
	"""Handles LoRA loading and unloading for generation."""

	def load_loras_for_generation(self, config: SupportsLoras, db: Session) -> bool:
		"""Load LoRAs for generation if specified in config.

		Args:
			config: Configuration object that contains LoRA settings
			db: Database session for loading LoRA information

		Returns:
			True if LoRAs were loaded, False otherwise

		Raises:
			ValueError: If a LoRA is not found in the database
		"""
		if not config.loras:
			return False

		logger.info(f'Loading {len(config.loras)} LoRAs for generation')
		lora_data: list[LoRAData] = []

		for lora_config in config.loras:
			lora = database_service.get_lora_by_id(db, lora_config.lora_id)
			if not lora:
				raise ValueError(f'LoRA with id {lora_config.lora_id} not found')

			lora_data.append(
				LoRAData(
					id=lora.id,
					name=lora.name,
					file_path=lora.file_path,
					weight=lora_config.weight,
				)
			)

		model_manager.pipeline_manager.load_loras(lora_data)
		return True

	def unload_loras(self) -> None:
		"""Unload LoRAs from the pipeline.

		Safe to call even if no LoRAs were loaded - handles gracefully with error logging.
		Logs errors if unloading fails but does not raise exceptions.
		"""
		try:
			model_manager.pipeline_manager.unload_loras()
		except Exception as error:
			logger.error(f'Failed to unload LoRAs: {error}')


lora_loader = LoRALoader()
