"""GPU and MPS resource cleanup utilities."""

import gc

import torch

from app.services import device_service, logger_service

logger = logger_service.get_logger(__name__, category='ModelLoad')


class ResourceManager:
	"""Manages GPU/MPS memory cleanup (stateless)."""

	def cleanup_pipeline(self, pipe, model_id: str) -> None:
		"""Clean up pipeline and free GPU/MPS resources.

		Args:
			pipe: Pipeline to clean up (can be None)
			model_id: Model identifier for logging
		"""
		logger.info(f'Starting resource cleanup for model: {model_id}')

		if pipe is not None:
			del pipe
			logger.info('Pipeline object deleted')

		gc.collect()
		logger.info('Garbage collection completed (1st pass)')

		if device_service.is_available:
			if device_service.is_cuda:
				self.cleanup_cuda_resources()
			elif device_service.is_mps:
				self.cleanup_mps_resources()
		else:
			logger.warning('GPU acceleration not available, cannot clear cache')

		gc.collect()
		logger.info('Final garbage collection completed (2nd pass)')

	def cleanup_cuda_resources(self) -> None:
		"""Synchronize CUDA operations and clear cache with metrics."""
		torch.cuda.synchronize()
		logger.info('CUDA synchronized - all pending operations completed')

		allocated_before = torch.cuda.memory_allocated() / (1024**3)
		reserved_before = torch.cuda.memory_reserved() / (1024**3)
		logger.info(f'GPU memory before: {allocated_before:.2f}GB allocated, {reserved_before:.2f}GB reserved')

		torch.cuda.empty_cache()

		gc.collect()

		allocated_after = torch.cuda.memory_allocated() / (1024**3)
		reserved_after = torch.cuda.memory_reserved() / (1024**3)
		logger.info(f'GPU memory after: {allocated_after:.2f}GB allocated, {reserved_after:.2f}GB reserved')
		logger.info(
			f'GPU memory freed: {allocated_before - allocated_after:.2f}GB allocated, '
			f'{reserved_before - reserved_after:.2f}GB reserved'
		)

	def cleanup_mps_resources(self) -> None:
		"""Synchronize MPS operations and clear cache."""
		torch.mps.synchronize()
		logger.info('MPS synchronized - all pending operations completed')
		torch.mps.empty_cache()
		gc.collect()
		logger.info('MPS cache cleared')


resource_manager = ResourceManager()
