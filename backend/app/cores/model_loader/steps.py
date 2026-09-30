"""Centralized model loading step definitions and progress emission."""

from enum import IntEnum
from typing import Optional

from app.schemas.model_loader import ModelLoadPhase, ModelLoadProgressResponse
from app.services import logger_service
from app.socket import socket_service

from .cancellation import CancellationToken

logger = logger_service.get_logger(__name__, category='ModelLoad')


class ModelLoadStep(IntEnum):
	"""Enumeration of all model loading steps."""

	INIT = 1
	CACHE_CHECK = 2
	BUILD_STRATEGIES = 3
	LOAD_WEIGHTS = 4
	LOAD_COMPLETE = 5
	MOVE_TO_DEVICE = 6
	APPLY_OPTIMIZATIONS = 7
	FINALIZE = 8


STEP_CONFIG: dict[ModelLoadStep, tuple[str, ModelLoadPhase]] = {
	ModelLoadStep.INIT: ('Initializing model loader...', ModelLoadPhase.INITIALIZATION),
	ModelLoadStep.CACHE_CHECK: ('Checking model cache...', ModelLoadPhase.INITIALIZATION),
	ModelLoadStep.BUILD_STRATEGIES: ('Preparing loading strategies...', ModelLoadPhase.LOADING_MODEL),
	ModelLoadStep.LOAD_WEIGHTS: ('Loading model weights...', ModelLoadPhase.LOADING_MODEL),
	ModelLoadStep.LOAD_COMPLETE: ('Model loaded successfully', ModelLoadPhase.LOADING_MODEL),
	ModelLoadStep.MOVE_TO_DEVICE: ('Moving model to device...', ModelLoadPhase.DEVICE_SETUP),
	ModelLoadStep.APPLY_OPTIMIZATIONS: ('Applying optimizations...', ModelLoadPhase.DEVICE_SETUP),
	ModelLoadStep.FINALIZE: ('Finalizing model setup...', ModelLoadPhase.OPTIMIZATION),
}

TOTAL_STEPS = len(ModelLoadStep)


def emit_step(
	model_id: str,
	step: ModelLoadStep,
	cancel_token: Optional[CancellationToken] = None,
) -> None:
	"""Emit model loading progress for a step.

	Args:
		model_id: Model identifier
		step: The loading step to emit
		cancel_token: Optional cancellation token to check before emitting
	"""
	if cancel_token:
		cancel_token.check_cancelled()

	message, phase = STEP_CONFIG[step]

	try:
		progress = ModelLoadProgressResponse(
			model_id=model_id,
			step=step.value,
			total=TOTAL_STEPS,
			phase=phase,
			message=message,
		)

		logger.info(f'{model_id} step={step.value}/{TOTAL_STEPS} phase={phase.value} msg="{message}"')
		socket_service.model_load_progress(progress)
	except Exception as error:
		logger.warning(f'Failed to emit model load progress: {error}')


__all__ = ['ModelLoadStep', 'STEP_CONFIG', 'TOTAL_STEPS', 'emit_step']
