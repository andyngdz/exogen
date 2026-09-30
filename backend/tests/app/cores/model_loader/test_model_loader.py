"""Tests for the model loader package."""

from __future__ import annotations

from pathlib import Path
from typing import Any
from unittest.mock import MagicMock, Mock, patch

import pytest

from app.constants.model_loader import ModelLoadingStrategy
from app.cores.model_loader.cancellation import CancellationException, CancellationToken
from app.cores.model_loader.model_loader import model_loader
from app.cores.model_loader.setup import (
	apply_device_optimizations,
	cleanup_partial_load,
	finalize_model_setup,
	move_to_device,
)
from app.cores.model_loader.steps import STEP_CONFIG, TOTAL_STEPS, ModelLoadStep, emit_step
from app.cores.model_loader.strategies import (
	build_loading_strategies,
	execute_loading_strategies,
	find_checkpoint_in_cache,
	find_single_file_checkpoint,
)
from app.schemas.model_loader import PretrainedStrategy, SingleFileStrategy
from app.services.device import DeviceType


def return_first_arg(arg: Any, *args: Any, **kwargs: Any) -> Any:
	return arg


class TestStepsModule:
	def test_total_steps_is_8(self) -> None:
		assert TOTAL_STEPS == 8

	def test_step_config_has_all_steps(self) -> None:
		for step in ModelLoadStep:
			assert step in STEP_CONFIG

	@patch('app.cores.model_loader.steps.socket_service')
	def test_emit_step_success(self, mock_socket: Mock) -> None:
		emit_step('mid', ModelLoadStep.INIT)
		mock_socket.model_load_progress.assert_called_once()

	@patch('app.cores.model_loader.steps.socket_service')
	def test_emit_step_handles_error(self, mock_socket: Mock) -> None:
		mock_socket.model_load_progress.side_effect = RuntimeError('boom')
		emit_step('mid', ModelLoadStep.INIT)
		mock_socket.model_load_progress.assert_called_once()


class TestStrategyHelpers:
	def test_find_single_file_checkpoint(self, tmp_path: Path) -> None:
		root = tmp_path / 'model'
		root.mkdir()
		ckpt = root / 'model.safetensors'
		ckpt.touch()
		assert find_single_file_checkpoint(str(root)) == str(ckpt)

	def test_find_single_file_checkpoint_missing(self) -> None:
		assert find_single_file_checkpoint('/does/not/exist') is None

	def test_find_checkpoint_in_cache(self, tmp_path: Path) -> None:
		cache = tmp_path / 'cache'
		snapshot_dir = cache / 'snapshots' / 'abc'
		snapshot_dir.mkdir(parents=True)
		ckpt = snapshot_dir / 'model.safetensors'
		ckpt.touch()
		assert find_checkpoint_in_cache(str(cache)) == str(ckpt)

	def test_build_loading_strategies_includes_single_file(self) -> None:
		strategies = build_loading_strategies('/tmp/foo.safetensors')
		assert strategies[0].type == ModelLoadingStrategy.SINGLE_FILE
		# use cast if we want type checking here, or just ignore for test since we know index 0 is single file
		assert getattr(strategies[0], 'checkpoint_path', '') == '/tmp/foo.safetensors'

	@patch('app.cores.model_loader.strategies._load_strategy_pipeline', return_value=MagicMock())
	@patch('app.cores.model_loader.strategies._get_strategy_type', return_value=ModelLoadingStrategy.SINGLE_FILE)
	@patch('app.cores.model_loader.strategies.emit_step')
	def test_execute_loading_strategies_success(
		self,
		mock_emit: Mock,
		mock_get_type: Mock,
		mock_load: Mock,
	) -> None:
		pipe = execute_loading_strategies(
			model_id='mid',
			strategies=[SingleFileStrategy(checkpoint_path='/tmp/foo.safetensors')],
			cancel_token=None,
		)
		assert pipe is mock_load.return_value
		mock_emit.assert_called_with('mid', ModelLoadStep.LOAD_WEIGHTS, None)

	@patch('app.cores.model_loader.strategies.socket_service')
	@patch('app.cores.model_loader.strategies._load_strategy_pipeline', side_effect=RuntimeError('boom'))
	@patch('app.cores.model_loader.strategies._get_strategy_type', return_value=ModelLoadingStrategy.SINGLE_FILE)
	@patch('app.cores.model_loader.strategies.emit_step')
	def test_execute_loading_strategies_failure(
		self,
		mock_emit: Mock,
		mock_get_type: Mock,
		mock_load: Mock,
		mock_socket: Mock,
	) -> None:
		with pytest.raises(RuntimeError):
			execute_loading_strategies(
				model_id='mid',
				strategies=[SingleFileStrategy(checkpoint_path='/tmp/foo.safetensors')],
				cancel_token=None,
			)
		mock_socket.model_load_failed.assert_called_once()


class TestSetupHelpers:
	@patch('app.cores.model_loader.setup.get_optimizer')
	def test_apply_device_optimizations(self, mock_get_optimizer: Mock) -> None:
		optimizer = Mock()
		optimizer.get_platform_name.return_value = 'Test'
		mock_get_optimizer.return_value = optimizer
		pipe = Mock()
		apply_device_optimizations(pipe)
		optimizer.apply.assert_called_once_with(pipe)

	def test_move_to_device_prefers_to_empty(self) -> None:
		pipe = Mock()
		pipe.to_empty.return_value = pipe
		assert move_to_device(pipe, 'cuda', 'prefix') is pipe
		pipe.to_empty.assert_called_once_with('cuda')
		pipe.to.assert_not_called()

	def test_move_to_device_falls_back(self) -> None:
		pipe = Mock()
		pipe.to_empty.side_effect = AttributeError('nope')
		pipe.to.return_value = pipe
		assert move_to_device(pipe, 'cuda', 'prefix') is pipe
		pipe.to.assert_called_once_with('cuda')

	@patch('app.cores.model_loader.setup.cleanup_gpu_model')
	def test_cleanup_partial_load(self, mock_cleanup: Mock) -> None:
		metrics = Mock(time_ms=1.0, objects_collected=1, error=None)
		mock_cleanup.return_value = metrics
		pipe = Mock()
		cleanup_partial_load(pipe)
		mock_cleanup.assert_called_once_with(pipe, name='partial pipeline')

	@patch('app.cores.model_loader.setup.apply_device_optimizations')
	@patch('app.cores.model_loader.setup.move_to_device', side_effect=return_first_arg)
	@patch('app.cores.model_loader.setup.emit_step')
	@patch('app.cores.model_loader.setup.device_service')
	def test_finalize_model_setup(
		self, mock_device_service: Mock, mock_emit: Mock, mock_move: Mock, mock_optimize: Mock
	) -> None:
		mock_device_service.device = DeviceType.CUDA
		pipe = Mock()
		pipe.reset_device_map = Mock()
		result = finalize_model_setup(pipe, 'mid', cancel_token=None)
		assert result is pipe
		mock_emit.assert_any_call('mid', ModelLoadStep.LOAD_COMPLETE, None)
		mock_move.assert_called_once()
		mock_optimize.assert_called_once_with(pipe)


class TestModelLoader:
	@patch('app.cores.model_loader.model_loader.socket_service')
	@patch('app.cores.model_loader.model_loader.finalize_model_setup', side_effect=return_first_arg)
	@patch('app.cores.model_loader.model_loader.execute_loading_strategies', return_value=MagicMock(name='pipe'))
	@patch(
		'app.cores.model_loader.model_loader.build_loading_strategies',
		return_value=[PretrainedStrategy(use_safetensors=True)],
	)
	@patch('app.cores.model_loader.model_loader.find_checkpoint_in_cache', return_value=None)
	@patch('app.cores.model_loader.model_loader.MaxMemoryConfig')
	@patch('app.cores.model_loader.model_loader.SessionLocal')
	def test_model_loader_success(
		self,
		mock_session: Mock,
		mock_max_memory: Mock,
		mock_find_cache: Mock,
		mock_build: Mock,
		mock_execute: Mock,
		mock_finalize: Mock,
		mock_socket: Mock,
	) -> None:
		mock_db = Mock()
		mock_session.return_value = mock_db
		mock_max_memory.return_value.to_dict.return_value = {}
		result = model_loader('mid')
		assert result is mock_execute.return_value
		mock_build.assert_called_once()
		mock_execute.assert_called_once()
		mock_finalize.assert_called_once()
		mock_db.close.assert_called_once()
		mock_socket.model_load_completed.assert_called_once()

	@patch('app.cores.model_loader.model_loader.cleanup_partial_load')
	@patch('app.cores.model_loader.model_loader.SessionLocal')
	@patch('app.cores.model_loader.model_loader.MaxMemoryConfig')
	def test_model_loader_handles_cancellation(
		self,
		mock_max_memory: Mock,
		mock_session: Mock,
		mock_cleanup: Mock,
	) -> None:
		mock_db = Mock()
		mock_session.return_value = mock_db
		mock_max_memory.return_value.to_dict.return_value = {}
		cancel_token = CancellationToken()
		cancel_token.cancel()
		with pytest.raises(CancellationException):
			model_loader('mid', cancel_token=cancel_token)
		mock_cleanup.assert_called_once_with(None)
		mock_db.close.assert_called_once()

	@patch('app.cores.model_loader.model_loader.cleanup_partial_load')
	@patch('app.cores.model_loader.model_loader.finalize_model_setup')
	@patch('app.cores.model_loader.model_loader.execute_loading_strategies', side_effect=RuntimeError('boom'))
	@patch(
		'app.cores.model_loader.model_loader.build_loading_strategies',
		return_value=[PretrainedStrategy(use_safetensors=True)],
	)
	@patch('app.cores.model_loader.model_loader.find_checkpoint_in_cache', return_value=None)
	@patch('app.cores.model_loader.model_loader.MaxMemoryConfig')
	@patch('app.cores.model_loader.model_loader.SessionLocal')
	def test_model_loader_handles_runtime_error(
		self,
		mock_session: Mock,
		mock_max_memory: Mock,
		mock_find_cache: Mock,
		mock_build: Mock,
		mock_execute: Mock,
		mock_finalize: Mock,
		mock_cleanup: Mock,
	) -> None:
		mock_db = Mock()
		mock_session.return_value = mock_db
		mock_max_memory.return_value.to_dict.return_value = {}
		with pytest.raises(RuntimeError):
			model_loader('mid')
		mock_cleanup.assert_called_once()
		mock_db.close.assert_called_once()
