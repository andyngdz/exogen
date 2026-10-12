"""Pipeline instance and configuration management."""

from pathlib import Path
from typing import Optional

from app.constants.error_messages import ERROR_NO_MODEL_LOADED
from app.constants.samplers import DEFAULT_SAMPLE_SIZE
from app.cores.samplers import SCHEDULER_MAPPING, SamplerType
from app.schemas.loras import LoRAData
from app.schemas.model_loader import DiffusersPipeline
from app.services import logger_service

logger = logger_service.get_logger(__name__, category='ModelLoad')


class PipelineManager:
	"""Manages the active diffusion pipeline and its configuration."""

	def __init__(self) -> None:
		self.pipe: Optional[DiffusersPipeline] = None
		self.model_id: Optional[str] = None

	def _get_pipe(self) -> DiffusersPipeline:
		"""Get pipeline or raise error if not loaded.

		Returns:
			Pipeline instance

		Raises:
			ValueError: If no model is loaded
		"""
		if self.pipe is None:
			raise ValueError(ERROR_NO_MODEL_LOADED)

		return self.pipe

	def set_pipeline(self, pipe: DiffusersPipeline, model_id: str) -> None:
		"""Store pipeline and model ID.

		Args:
			pipe: Pipeline instance to store
			model_id: Model identifier
		"""
		self.pipe = pipe
		self.model_id = model_id
		logger.info(f'Pipeline set for model: {model_id}')

	def clear_pipeline(self) -> None:
		"""Clear pipeline and model ID."""
		self.pipe = None
		self.model_id = None
		logger.info('Pipeline cleared')

	def get_pipeline(self) -> Optional[DiffusersPipeline]:
		"""Get current pipeline.

		Returns:
			Current pipeline instance or None if not loaded
		"""
		return self.pipe

	def get_model_id(self) -> Optional[str]:
		"""Get current model ID.

		Returns:
			Current model ID or None if not loaded
		"""
		return self.model_id

	def set_sampler(self, sampler: SamplerType) -> None:
		"""Dynamically set the sampler for the loaded pipeline.

		Args:
			sampler: Sampler type to set

		Raises:
			ValueError: If no model is loaded or sampler is unsupported
		"""
		pipe = self._get_pipe()

		scheduler = SCHEDULER_MAPPING.get(sampler)
		if not scheduler:
			raise ValueError(f'Unsupported sampler type: {sampler.value}')

		config = pipe.scheduler.config
		kwargs = {}

		if sampler in [SamplerType.DPM_SOLVER_MULTISTEP_KARRAS, SamplerType.DPM_SOLVER_SDE_KARRAS]:
			kwargs['use_karras_sigmas'] = True

		new_scheduler = scheduler.from_config(config, **kwargs)
		pipe.scheduler = new_scheduler
		logger.info(f'Sampler set to: {sampler.value}')

	def get_sample_size(self) -> int:
		"""Get sample size from pipeline's UNet configuration.

		Returns:
			Sample size from UNet config or default value

		Raises:
			ValueError: If no model is loaded
		"""
		pipe = self._get_pipe()

		unet_config = pipe.unet.config
		if hasattr(unet_config, 'sample_size'):
			sample_size: int = unet_config.sample_size
			return sample_size
		else:
			return DEFAULT_SAMPLE_SIZE

	def load_loras(self, lora_configs: list[LoRAData]) -> None:
		"""Load LoRAs with weights into the pipeline.

		Incompatible LoRAs are skipped with warnings. Generation continues with compatible LoRAs.

		Args:
			lora_configs: List of LoRAData models

		Raises:
			ValueError: If no model is loaded or all LoRAs fail to load
		"""
		pipe = self._get_pipe()

		if not lora_configs:
			logger.warning('load_loras called with empty config list')
			return

		adapter_names = []
		adapter_weights = []
		failed_loras = []

		for config in lora_configs:
			name = config.name
			adapter_name = f'lora_{config.id}'

			try:
				logger.info(f"Loading LoRA '{name}' as adapter '{adapter_name}' (weight: {config.weight})")

				lora_path = Path(config.file_path)
				lora_dir = str(lora_path.parent)
				lora_filename = lora_path.name

				pipe.load_lora_weights(lora_dir, weight_name=lora_filename, adapter_name=adapter_name)
				adapter_names.append(adapter_name)
				adapter_weights.append(config.weight)
				logger.info(f"Successfully loaded LoRA '{name}'")

			except Exception as error:
				error_str = str(error)
				if 'size mismatch' in error_str:
					logger.warning(
						f"Skipping LoRA '{name}': incompatible with current model architecture. "
						+ 'This LoRA was likely trained for a different model (e.g., SD 1.5 vs SDXL).'
					)
				else:
					logger.warning(f"Skipping LoRA '{name}': {error}")
				failed_loras.append(name)

		if not adapter_names:
			error_msg = f'All {len(lora_configs)} LoRAs failed to load. Incompatible with current model.'
			logger.error(error_msg)
			raise ValueError(error_msg)

		if failed_loras:
			logger.warning(
				f'Loaded {len(adapter_names)}/{len(lora_configs)} LoRAs. Skipped incompatible: {", ".join(failed_loras)}'
			)

		pipe.set_adapters(adapter_names, adapter_weights=adapter_weights)
		logger.info(f'Successfully activated {len(adapter_names)} compatible LoRAs')

	def unload_loras(self) -> None:
		"""Remove all LoRAs from the pipeline.

		Raises:
			ValueError: If no model is loaded
		"""
		pipe = self._get_pipe()

		try:
			pipe.unload_lora_weights()
			logger.info('Unloaded all LoRAs')
		except Exception as error:
			logger.error(f'Failed to unload LoRAs: {error}')
			raise ValueError(f'Failed to unload LoRAs: {error}')
