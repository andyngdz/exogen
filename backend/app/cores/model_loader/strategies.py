import os
from pathlib import Path
from typing import Any, Optional

from diffusers.pipelines.auto_pipeline import AutoPipelineForText2Image
from diffusers.pipelines.stable_diffusion import StableDiffusionPipeline
from diffusers.pipelines.stable_diffusion_3.pipeline_stable_diffusion_3 import StableDiffusion3Pipeline
from diffusers.pipelines.stable_diffusion_xl import StableDiffusionXLPipeline

from app.constants.model_loader import ModelLoadingStrategy
from app.schemas.model_loader import (
	DiffusersPipeline,
	ModelLoadFailed,
	PretrainedStrategy,
	SingleFilePipelineClass,
	SingleFileStrategy,
	Strategy,
)
from app.services import device_service, logger_service
from app.socket import socket_service
from config import CACHE_FOLDER

from .cancellation import CancellationToken
from .steps import ModelLoadStep, emit_step

logger = logger_service.get_logger(__name__, category='ModelLoad')


def find_single_file_checkpoint(model_path: str) -> Optional[str]:
	if not os.path.exists(model_path):
		return None

	checkpoint_files = list(Path(model_path).glob('*.safetensors'))
	if checkpoint_files:
		checkpoint_path = str(checkpoint_files[0])
		logger.info(f'Found single-file checkpoint: {checkpoint_path}')
		return checkpoint_path

	return None


def find_checkpoint_in_cache(model_cache_path: str) -> Optional[str]:
	if not os.path.exists(model_cache_path):
		return None

	snapshots_dir = os.path.join(model_cache_path, 'snapshots')
	if not os.path.exists(snapshots_dir):
		return None

	snapshots = [d for d in os.listdir(snapshots_dir) if os.path.isdir(os.path.join(snapshots_dir, d))]
	if not snapshots:
		return None

	latest_snapshot = os.path.join(snapshots_dir, snapshots[0])
	return find_single_file_checkpoint(latest_snapshot)


def build_loading_strategies(checkpoint_path: Optional[str]) -> list[Strategy]:
	strategies: list[Strategy] = []
	if checkpoint_path:
		strategies.append(SingleFileStrategy(checkpoint_path=checkpoint_path))

	strategies.append(PretrainedStrategy(use_safetensors=True))
	strategies.append(PretrainedStrategy(use_safetensors=False))
	strategies.append(PretrainedStrategy(use_safetensors=True, variant='fp16'))
	strategies.append(PretrainedStrategy(use_safetensors=False, variant='fp16'))

	return strategies


def _load_single_file(checkpoint: str) -> DiffusersPipeline:
	errors = []

	# Try pipelines in order: SD 1.5 (most common), SDXL, SD3
	pipeline_classes: list[SingleFilePipelineClass] = [
		StableDiffusionPipeline,
		StableDiffusionXLPipeline,
		StableDiffusion3Pipeline,
	]

	for pipeline_class in pipeline_classes:
		try:
			logger.debug(f'Trying {pipeline_class.__name__} for single-file checkpoint')

			pipe = pipeline_class.from_single_file(
				checkpoint,
				torch_dtype=device_service.torch_dtype,
			)

			logger.info(f'Successfully loaded with {pipeline_class.__name__}')
			return pipe
		except Exception as error:
			errors.append(f'{pipeline_class.__name__}: {error}')

	raise ValueError(f'Failed to load single-file checkpoint {checkpoint}. Tried: {", ".join(errors)}')


def _load_pretrained(model_id: str, strategy: PretrainedStrategy) -> DiffusersPipeline:
	load_params: dict[str, Any] = {'use_safetensors': strategy.use_safetensors}
	if strategy.variant:
		load_params['variant'] = strategy.variant

	return AutoPipelineForText2Image.from_pretrained(
		model_id,
		cache_dir=CACHE_FOLDER,
		low_cpu_mem_usage=True,
		torch_dtype=device_service.torch_dtype,
		**load_params,
	)


def _get_strategy_type(strategy: Strategy) -> ModelLoadingStrategy:
	return ModelLoadingStrategy(strategy.type)


def _load_strategy_pipeline(
	model_id: str,
	strategy: Strategy,
	strategy_type: ModelLoadingStrategy,
) -> DiffusersPipeline:
	if strategy_type == ModelLoadingStrategy.SINGLE_FILE:
		if isinstance(strategy, SingleFileStrategy):
			if not strategy.checkpoint_path:
				raise ValueError('Missing checkpoint path for single-file strategy')

			return _load_single_file(strategy.checkpoint_path)

	if isinstance(strategy, PretrainedStrategy):
		return _load_pretrained(model_id, strategy)

	raise ValueError(f'Unknown strategy type: {strategy}')


def execute_loading_strategies(
	model_id: str,
	strategies: list[Strategy],
	cancel_token: Optional[CancellationToken],
) -> DiffusersPipeline:
	last_error: Optional[Exception] = None

	for idx, strategy in enumerate(strategies, 1):
		emit_step(model_id, ModelLoadStep.LOAD_WEIGHTS, cancel_token)

		try:
			strategy_type = _get_strategy_type(strategy)
			logger.info(f'Trying loading strategy {idx}/{len(strategies)} ({strategy_type}): {strategy}')

			pipe = _load_strategy_pipeline(model_id, strategy, strategy_type)

			logger.info(f'Successfully loaded model using strategy {idx}')
			return pipe
		except Exception as error:
			last_error = error
			logger.warning(f'Strategy {idx} failed: {error}')

			continue

	error_msg = f'Failed to load model {model_id} with all strategies. Last error: {last_error}'
	logger.error(error_msg)
	socket_service.model_load_failed(ModelLoadFailed(model_id=model_id, error=str(last_error)))

	if last_error is not None:
		raise last_error
	raise RuntimeError(error_msg)


__all__ = [
	'find_single_file_checkpoint',
	'find_checkpoint_in_cache',
	'build_loading_strategies',
	'execute_loading_strategies',
]
