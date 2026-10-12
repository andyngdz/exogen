"""Model manager facade coordinating specialized managers."""

from typing import Optional

from app.cores.samplers import SamplerType
from app.schemas.model_family import ModelFamily
from app.services import logger_service

from .loader_service import LoaderService
from .pipeline_manager import DiffusersPipeline, PipelineManager
from .resource_manager import ResourceManager
from .state_manager import ModelState, StateManager, StateTransitionReason

logger = logger_service.get_logger(__name__, category='ModelLoad')


class ModelManager:
	"""
	Facade for model loading, state management, and resource cleanup.

	Internally delegates to specialized managers:
	- StateManager: State machine transitions
	- ResourceManager: GPU/MPS memory cleanup
	- PipelineManager: Pipeline storage and configuration
	- LoaderService: Async loading orchestration
	"""

	def __init__(self) -> None:
		self.state_manager: StateManager = StateManager()
		self.resource_manager: ResourceManager = ResourceManager()
		self.pipeline_manager: PipelineManager = PipelineManager()
		self.loader_service: LoaderService = LoaderService(
			state_manager=self.state_manager, resource_manager=self.resource_manager, pipeline_manager=self.pipeline_manager
		)
		logger.info('ModelManager initialized with modular architecture')

	async def load_model_async(self, id: str) -> dict[str, object]:
		"""Load model asynchronously with cancellation support.

		Args:
			id: Model identifier to load

		Returns:
			Model configuration dictionary

		Raises:
			ValueError: If model loading fails or is in invalid state
			CancellationException: If loading is cancelled
		"""
		return await self.loader_service.load_model_async(id)

	async def unload_model_async(self) -> None:
		"""Unload model asynchronously.

		This method can cancel ongoing load operations before unloading.
		"""
		await self.loader_service.unload_model_async()

	@property
	def current_state(self) -> ModelState:
		"""Get current model state.

		Returns:
			Current ModelState
		"""
		return self.state_manager.current_state

	def set_state(self, new_state: ModelState, reason: StateTransitionReason) -> None:
		"""Set model state with logging.

		Args:
			new_state: New state to transition to
			reason: Predefined reason for transition
		"""
		self.state_manager.set_state(new_state, reason)

	def set_sampler(self, sampler: SamplerType) -> None:
		"""Set sampler for loaded pipeline.

		Args:
			sampler: Sampler type to set

		Raises:
			ValueError: If no model is loaded or sampler is unsupported
		"""
		self.pipeline_manager.set_sampler(sampler)

	@property
	def loaded_model_family(self) -> ModelFamily:
		pipeline = self.pipeline_manager.get_pipeline()
		if pipeline is None:
			return ModelFamily.UNKNOWN

		model_id = self.pipeline_manager.get_model_id()
		pipeline_class_name: str | None = None
		try:
			raw_class_name = pipeline.config.get('_class_name')
			pipeline_class_name = raw_class_name if isinstance(raw_class_name, str) else None
		except Exception:
			pipeline_class_name = None

		resolved_class_name = pipeline_class_name or pipeline.__class__.__name__

		pipeline_module = pipeline.__class__.__module__
		if resolved_class_name.startswith('Flux') or '.pipelines.flux' in pipeline_module:
			return ModelFamily.FLUX

		if 'StableDiffusionXL' in resolved_class_name:
			return ModelFamily.SDXL

		if 'StableDiffusion3' in resolved_class_name:
			return ModelFamily.SD3

		if 'StableDiffusion' in resolved_class_name:
			if model_id is not None and 'stable-diffusion-2' in model_id:
				return ModelFamily.SD2
			return ModelFamily.SD15

		return ModelFamily.UNKNOWN

	@property
	def has_model(self) -> bool:
		"""Check if a model is currently loaded.

		Returns:
			True if model is loaded, False otherwise
		"""
		return self.pipeline_manager.get_pipeline() is not None

	@property
	def sample_size(self) -> int:
		"""Get sample size from pipeline.

		Returns:
			Sample size from UNet config or default value

		Raises:
			ValueError: If no model is loaded
		"""
		return self.pipeline_manager.get_sample_size()

	@property
	def pipe(self) -> DiffusersPipeline:
		"""Get current pipeline.

		Returns:
			Current pipeline instance

		Raises:
			ValueError: If no model is currently loaded
		"""
		pipeline = self.pipeline_manager.get_pipeline()
		if pipeline is None:
			raise ValueError('No model is currently loaded')
		return pipeline

	@pipe.setter
	def pipe(self, value: DiffusersPipeline) -> None:
		"""Set pipeline directly (for img2img conversion).

		Args:
			value: Pipeline instance to set

		Raises:
			ValueError: If no model_id exists (must load model first)
		"""
		model_id = self.pipeline_manager.get_model_id()
		if model_id is None:
			raise ValueError('Cannot set pipeline without loading a model first')

		self.pipeline_manager.set_pipeline(value, model_id)

	@property
	def id(self) -> Optional[str]:
		"""Get current model ID (backward compatibility).

		Returns:
			Current model ID or None if not loaded
		"""
		return self.pipeline_manager.get_model_id()

	@id.setter
	def id(self, value: Optional[str]):
		"""Set model ID directly (for backward compatibility).

		Args:
			value: Model ID to set or None to clear

		Warning:
			This setter directly modifies the model_id without updating the pipeline.
			Use with caution - prefer using load_model_async() for proper state management.
		"""
		if value is None:
			self.pipeline_manager.clear_pipeline()
		else:
			if self.pipeline_manager.pipe is None:
				logger.warning(f'Setting model_id to {value} without loaded pipeline - state may be inconsistent')
			self.pipeline_manager.model_id = value

	@property
	def lock(self):
		"""Expose lock for external synchronization (advanced use).

		Returns:
			AsyncIO lock instance
		"""
		return self.loader_service.lock


# Singleton instance
model_manager = ModelManager()
