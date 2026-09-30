"""GPU utility functions for memory management."""

import gc
import time

import torch

from app.schemas.hardware import CleanupMetrics
from app.services import device_service, logger_service

logger = logger_service.get_logger(__name__, category='GPU')


def clear_device_cache(reason: str) -> None:
	"""Clear CUDA or MPS cache if an accelerator is available."""
	if not device_service.is_available:
		logger.info('Skipped device cache clear: accelerator not available')
		return

	try:
		if device_service.is_cuda and torch.cuda.is_available():
			torch.cuda.empty_cache()
			logger.info(f'Cleared CUDA cache: {reason}')
		elif device_service.is_mps and hasattr(torch, 'mps') and hasattr(torch.mps, 'empty_cache'):
			torch.mps.empty_cache()
			logger.info(f'Cleared MPS cache: {reason}')
		else:
			logger.info('Skipped device cache clear: no supported accelerator detected')
	except Exception as error:
		logger.warning(f'Failed to clear device cache: {error}')


def cleanup_gpu_model(model, name: str = 'model') -> CleanupMetrics:
	"""Clean up a GPU model and free VRAM.

	Args:
		model: The model/pipeline to clean up
		name: Name for logging purposes

	Returns:
		CleanupMetrics: Cleanup metrics with timing and GC stats
	"""
	if model is None:
		return CleanupMetrics(time_ms=0, objects_collected=0)

	start = time.time()

	try:
		del model
		collected = gc.collect()

		clear_device_cache(reason=f'Cleanup GPU model {name}')

		elapsed_ms = (time.time() - start) * 1000
		logger.info(f'Cleaned up {name}: {elapsed_ms:.1f}ms, {collected} objects collected')

		return CleanupMetrics(time_ms=elapsed_ms, objects_collected=collected)

	except Exception as e:
		logger.warning(f'Error during {name} cleanup: {e}')
		return CleanupMetrics(time_ms=0, objects_collected=0, error=str(e))
