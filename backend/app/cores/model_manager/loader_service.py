"""Model loading orchestration with cancellation support."""

import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import Optional

from app.cores.model_loader import (
	CancellationException,
	CancellationToken,
	DuplicateLoadRequestError,
	model_loader,
)
from app.schemas.model_loader import ModelLoadCompletedResponse
from app.services import logger_service
from app.socket import socket_service

from .pipeline_manager import PipelineManager
from .resource_manager import ResourceManager
from .state_manager import ModelState, StateManager, StateTransitionReason

logger = logger_service.get_logger(__name__, category='ModelLoad')


class LoaderService:
	"""Orchestrates model loading with state management and cancellation."""

	def __init__(
		self,
		state_manager: StateManager,
		resource_manager: ResourceManager,
		pipeline_manager: PipelineManager,
	) -> None:
		self.state_manager = state_manager
		self.resources_manager = resource_manager
		self.pipeline_manager = pipeline_manager

		self.lock = asyncio.Lock()
		self.cancel_token: Optional[CancellationToken] = None
		self.loading_task: Optional[asyncio.Task] = None

		self.executor = ThreadPoolExecutor(max_workers=1)

		logger.info('LoaderService initialized with concurrency controls')

	def shutdown(self) -> None:
		"""Shutdown the executor thread pool."""
		self.executor.shutdown(wait=True)
		logger.info('LoaderService executor shut down')

	async def load_model_async(self, model_id: str) -> dict[str, object]:
		"""Load model asynchronously with automatic cancellation of previous loads.

		Args:
			model_id: Model identifier to load

		Returns:
			Model configuration dictionary

		Raises:
			ValueError: If model loading fails or is in invalid state
			CancellationException: If loading is cancelled
			DuplicateLoadRequestError: If same model is already loading
		"""
		async with self.lock:
			# If same model is already loading, skip the duplicate request
			if self.pipeline_manager.model_id == model_id and self.state_manager.current_state == ModelState.LOADING:
				logger.info(f'Model {model_id} is already loading, skipping duplicate request')
				raise DuplicateLoadRequestError(f'Model {model_id} is already loading')

			if self.state_manager.current_state == ModelState.LOADING:
				logger.info(f'Another load in progress, need to cancel for new load: {model_id}')

		if self.state_manager.current_state == ModelState.LOADING:
			await self.cancel_current_load()

		async with self.lock:
			logger.info(f'Request to load: {model_id}, current state: {self.state_manager.current_state.value}')

			if (
				self.pipeline_manager.model_id == model_id
				and self.pipeline_manager.pipe is not None
				and self.state_manager.current_state == ModelState.LOADED
			):
				logger.info(f'Model {model_id} already loaded, returning config')
				return dict(self.pipeline_manager.pipe.config)

			if not self.state_manager.can_transition_to(ModelState.LOADING):
				error_msg = f'Cannot load model in state {self.state_manager.current_state.value}'
				logger.error(error_msg)
				raise ValueError(error_msg)

			self.state_manager.set_state(ModelState.LOADING, StateTransitionReason.LOAD_REQUESTED)
			self.cancel_token = CancellationToken()
			self.loading_task = asyncio.current_task()

		try:
			logger.info(f'Executing load for {model_id}')
			config = await self.execute_load_in_background(model_id)

			async with self.lock:
				self.state_manager.set_state(ModelState.LOADED, StateTransitionReason.LOAD_COMPLETED)
				self.loading_task = None
				self.cancel_token = None
				logger.info(f'Successfully loaded {model_id}')

			return config

		except CancellationException:
			async with self.lock:
				self.state_manager.set_state(ModelState.IDLE, StateTransitionReason.LOAD_CANCELLED)
				self.loading_task = None
				self.cancel_token = None
			logger.info(f'Model loading cancelled for {id}')
			raise

		except Exception as error:
			async with self.lock:
				self.state_manager.set_state(ModelState.ERROR, StateTransitionReason.LOAD_FAILED)
				self.loading_task = None
				self.cancel_token = None
			logger.error(f'Error loading {id}: {error}')
			raise

	async def unload_model_async(self) -> None:
		"""Unload model asynchronously with cancellation support.

		This method can cancel ongoing load operations before unloading.
		It's safe to call during React useEffect cleanup.
		"""
		async with self.lock:
			logger.info(f'Request to unload, current state: {self.state_manager.current_state.value}')

			if self.state_manager.current_state == ModelState.LOADING:
				logger.info('Cancelling in-progress load before unload')

		if self.state_manager.current_state == ModelState.LOADING:
			await self.cancel_current_load()

		async with self.lock:
			if self.state_manager.current_state == ModelState.IDLE:
				logger.info('No model loaded, nothing to unload')
				return

			if self.state_manager.current_state == ModelState.LOADED:
				self.state_manager.set_state(ModelState.UNLOADING, StateTransitionReason.UNLOAD_REQUESTED)

				try:
					self.unload_model_sync()
					self.state_manager.set_state(ModelState.IDLE, StateTransitionReason.UNLOAD_COMPLETED)
					logger.info('Model unloaded successfully')
				except Exception as e:
					self.state_manager.set_state(ModelState.ERROR, StateTransitionReason.UNLOAD_FAILED)
					logger.error(f'Error unloading model: {e}')
					raise

			elif self.state_manager.current_state == ModelState.ERROR:
				self.unload_model_sync()
				self.state_manager.set_state(ModelState.IDLE, StateTransitionReason.RESET_FROM_ERROR)
				logger.info('Reset to IDLE state')

	async def cancel_current_load(self) -> None:
		"""Cancel any in-progress model loading operation.

		This method is safe to call even if no load is in progress.
		"""
		if self.cancel_token:
			self.cancel_token.cancel()
			logger.info('Cancellation token flagged')

		if self.loading_task and not self.loading_task.done():
			logger.info('Waiting for load task to complete cancellation')
			try:
				await self.loading_task
			except (ValueError, CancellationException, asyncio.CancelledError):
				logger.info('Load task cancelled successfully')
			except Exception as e:
				logger.warning(f'Unexpected error during load cancellation: {e}')

	async def execute_load_in_background(self, model_id: str) -> dict:
		"""Execute model loading in background thread pool.

		Args:
			model_id: Model identifier to load

		Returns:
			Model configuration dictionary
		"""
		loop = asyncio.get_event_loop()
		return await loop.run_in_executor(self.executor, self.load_model_sync, model_id)

	def load_model_sync(self, model_id: str) -> dict[str, object]:
		"""Synchronous model loading (called from executor thread).

		Args:
			model_id: Model identifier to load

		Returns:
			Model configuration dictionary

		Raises:
			CancellationException: If loading is cancelled via cancel_token
		"""
		logger.info(f'Loading model: {model_id}')

		if self.pipeline_manager.pipe is not None:
			logger.info(f'Unloading existing model {self.pipeline_manager.model_id} before loading {model_id}')
			self.unload_model_sync()

		logger.info(f'Starting model_loader for {model_id}')
		pipe = model_loader(model_id, self.cancel_token)

		logger.info(f'Model {model_id} loaded successfully')
		self.pipeline_manager.set_pipeline(pipe, model_id)

		socket_service.model_load_completed(ModelLoadCompletedResponse(model_id=model_id))

		return dict(pipe.config)

	def unload_model_sync(self) -> None:
		"""Synchronous model unloading.

		Cleans up pipeline resources and clears pipeline reference.
		Safe to call even if no model is loaded.
		"""
		if self.pipeline_manager.pipe is not None and self.pipeline_manager.model_id is not None:
			logger.info(f'Unloading model: {self.pipeline_manager.model_id}')
			self.resources_manager.cleanup_pipeline(self.pipeline_manager.pipe, self.pipeline_manager.model_id)
			self.pipeline_manager.clear_pipeline()
