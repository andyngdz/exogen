from typing import Optional, cast

from app.cores.gpu_utils import cleanup_gpu_model
from app.cores.platform_optimizations import get_optimizer
from app.schemas.model_loader import DiffusersPipeline, DiffusersPipelineProtocol
from app.services import device_service, logger_service

from .cancellation import CancellationToken
from .steps import ModelLoadStep, emit_step

logger = logger_service.get_logger(__name__, category='ModelLoad')


def apply_device_optimizations(pipe: DiffusersPipeline) -> None:
	optimizer = get_optimizer()
	optimizer.apply(pipe)
	logger.info(f'Applied {optimizer.get_platform_name()} optimizations successfully')


def move_to_device(pipe: DiffusersPipeline, device: str, log_prefix: str) -> DiffusersPipeline:
	protocol_pipe = cast(DiffusersPipelineProtocol, pipe)
	try:
		result = protocol_pipe.to_empty(device)
		logger.info(f'{log_prefix}, moved to {device} device using to_empty()')
	except (AttributeError, TypeError):
		result = protocol_pipe.to(device)
		logger.info(f'{log_prefix}, moved to {device} device using to()')

	return cast(DiffusersPipeline, result)


def cleanup_partial_load(pipe: Optional[DiffusersPipeline]) -> None:
	if pipe is None:
		return

	logger.info('Cleaning up partially loaded model...')
	metrics = cleanup_gpu_model(pipe, name='partial pipeline')
	logger.info(
		f'Partial load cleanup complete: {metrics.time_ms:.1f}ms, '
		+ f'{metrics.objects_collected} objects collected'
		+ (f', error: {metrics.error}' if metrics.error else '')
	)


def finalize_model_setup(
	pipe: DiffusersPipeline,
	model_id: str,
	cancel_token: Optional[CancellationToken],
) -> DiffusersPipeline:
	emit_step(model_id, ModelLoadStep.LOAD_COMPLETE, cancel_token)

	if hasattr(pipe, 'reset_device_map'):
		pipe.reset_device_map()
		logger.info(f'Reset device map for pipeline {model_id}')

	emit_step(model_id, ModelLoadStep.MOVE_TO_DEVICE, cancel_token)

	pipe = move_to_device(pipe, device_service.device.value, f'Pipeline {model_id}')

	emit_step(model_id, ModelLoadStep.APPLY_OPTIMIZATIONS, cancel_token)
	apply_device_optimizations(pipe)

	emit_step(model_id, ModelLoadStep.FINALIZE, cancel_token)
	return pipe


__all__ = [
	'apply_device_optimizations',
	'move_to_device',
	'cleanup_partial_load',
	'finalize_model_setup',
]
