"""Tests for the model loader strategies module."""

from __future__ import annotations

from pathlib import Path
from typing import Any
from unittest.mock import Mock, patch

import pytest

from app.constants.model_loader import ModelLoadingStrategy
from app.cores.model_loader.strategies import (
	_get_strategy_type,
	_load_pretrained,
	_load_single_file,
	_load_strategy_pipeline,
	build_loading_strategies,
	execute_loading_strategies,
	find_checkpoint_in_cache,
	find_single_file_checkpoint,
)
from app.schemas.model_loader import PretrainedStrategy, SingleFileStrategy, Strategy


class TestFindSingleFileCheckpoint:
	def test_finds_safetensors_file(self, tmp_path: Path) -> None:
		model_dir = tmp_path / 'model'
		model_dir.mkdir()
		checkpoint_file = model_dir / 'model.safetensors'
		checkpoint_file.touch()

		result = find_single_file_checkpoint(str(model_dir))

		assert result == str(checkpoint_file)

	def test_returns_none_when_directory_not_exists(self) -> None:
		result = find_single_file_checkpoint('/nonexistent/path')
		assert result is None

	def test_returns_none_when_no_safetensors_files(self, tmp_path: Path) -> None:
		model_dir = tmp_path / 'model'
		model_dir.mkdir()
		(model_dir / 'config.json').touch()
		result = find_single_file_checkpoint(str(model_dir))
		assert result is None


class TestFindCheckpointInCache:
	def test_finds_checkpoint_in_snapshot(self, tmp_path: Path) -> None:
		cache_dir = tmp_path / 'cache'
		snapshots_dir = cache_dir / 'snapshots'
		snapshot_dir = snapshots_dir / 'abc123'
		snapshot_dir.mkdir(parents=True)
		checkpoint_file = snapshot_dir / 'model.safetensors'
		checkpoint_file.touch()

		result = find_checkpoint_in_cache(str(cache_dir))
		assert result == str(checkpoint_file)

	def test_returns_none_when_cache_not_exists(self) -> None:
		result = find_checkpoint_in_cache('/nonexistent/cache')
		assert result is None

	def test_returns_none_when_snapshots_dir_missing(self, tmp_path: Path) -> None:
		cache_dir = tmp_path / 'cache'
		cache_dir.mkdir()
		result = find_checkpoint_in_cache(str(cache_dir))
		assert result is None

	def test_returns_none_when_no_snapshots_exist(self, tmp_path: Path) -> None:
		cache_dir = tmp_path / 'cache'
		snapshots_dir = cache_dir / 'snapshots'
		snapshots_dir.mkdir(parents=True)
		result = find_checkpoint_in_cache(str(cache_dir))
		assert result is None


class TestBuildLoadingStrategies:
	def test_includes_single_file_strategy_when_path_provided(self) -> None:
		strategies = build_loading_strategies('/path/to/checkpoint.safetensors')
		assert len(strategies) == 5
		assert isinstance(strategies[0], SingleFileStrategy)
		assert strategies[0].type == ModelLoadingStrategy.SINGLE_FILE
		assert strategies[0].checkpoint_path == '/path/to/checkpoint.safetensors'

	def test_excludes_single_file_strategy_when_path_none(self) -> None:
		strategies = build_loading_strategies(None)
		assert len(strategies) == 4
		assert all(isinstance(s, PretrainedStrategy) and s.type == ModelLoadingStrategy.PRETRAINED for s in strategies)


class TestLoadSingleFile:
	@patch('app.cores.model_loader.strategies.device_service')
	def test_loads_single_file_successfully(self, mock_device_service: Mock) -> None:
		mock_device_service.torch_dtype = 'float16'
		checkpoint = '/path/to/checkpoint.safetensors'

		# Define dummy classes to satisfy isinstance checks
		class DummySDPipeline:
			@classmethod
			def from_single_file(cls, checkpoint: str, **kwargs: Any) -> Any:
				# Verify safety_checker is NOT passed (removed from pipeline loading)
				assert 'safety_checker' not in kwargs
				assert 'feature_extractor' not in kwargs
				return Mock(spec=DummySDPipeline)

		class DummySDXLPipeline:
			@classmethod
			def from_single_file(cls, checkpoint: str, **kwargs: Any) -> Any:
				raise RuntimeError('Not XL')

		# Mock the pipeline classes at module level since they're imported at the top
		with patch(
			'app.cores.model_loader.strategies.StableDiffusionPipeline',
			new=DummySDPipeline,
		):
			with patch(
				'app.cores.model_loader.strategies.StableDiffusionXLPipeline',
				new=DummySDXLPipeline,
			):
				result = _load_single_file(checkpoint)

				assert isinstance(result, Mock)  # It returns the mock from DummySDPipeline

	def test_raises_value_error_when_all_classes_fail(self) -> None:
		checkpoint = '/path/to/checkpoint.safetensors'

		class DummySDPipeline:
			@classmethod
			def from_single_file(cls, *args: Any, **kwargs: Any) -> Any:
				raise RuntimeError('Fail SD')

		class DummySDXLPipeline:
			@classmethod
			def from_single_file(cls, *args: Any, **kwargs: Any) -> Any:
				raise RuntimeError('Fail XL')

		with patch(
			'diffusers.pipelines.stable_diffusion.pipeline_stable_diffusion.StableDiffusionPipeline',
			new=DummySDPipeline,
		):
			with patch(
				'diffusers.pipelines.stable_diffusion_xl.pipeline_stable_diffusion_xl.StableDiffusionXLPipeline',
				new=DummySDXLPipeline,
			):
				with pytest.raises(ValueError, match='Failed to load single-file checkpoint'):
					_load_single_file(checkpoint)


class TestLoadPretrained:
	@patch('app.cores.model_loader.strategies.AutoPipelineForText2Image')
	@patch('app.cores.model_loader.strategies.device_service')
	def test_loads_pretrained_successfully(self, mock_device_service: Mock, mock_auto_pipeline: Mock) -> None:
		mock_device_service.torch_dtype = 'float16'
		model_id = 'test-model'
		strategy = PretrainedStrategy(use_safetensors=True)
		mock_pipe = Mock()
		mock_auto_pipeline.from_pretrained.return_value = mock_pipe

		result = _load_pretrained(model_id, strategy)

		assert result is mock_pipe
		mock_auto_pipeline.from_pretrained.assert_called_once()
		_, kwargs = mock_auto_pipeline.from_pretrained.call_args
		assert kwargs['use_safetensors'] is True
		# Verify safety_checker is NOT passed (removed from pipeline loading)
		assert 'safety_checker' not in kwargs
		assert 'feature_extractor' not in kwargs


class TestGetStrategyType:
	def test_returns_correct_strategy_type(self) -> None:
		strategy = SingleFileStrategy(checkpoint_path='path')
		assert _get_strategy_type(strategy) == ModelLoadingStrategy.SINGLE_FILE

		strategy = PretrainedStrategy(use_safetensors=True)
		assert _get_strategy_type(strategy) == ModelLoadingStrategy.PRETRAINED


class TestLoadStrategyPipeline:
	@patch('app.cores.model_loader.strategies._load_single_file')
	def test_calls_load_single_file(self, mock_load_single: Mock) -> None:
		strategy = SingleFileStrategy(checkpoint_path='/path')
		_load_strategy_pipeline('id', strategy, ModelLoadingStrategy.SINGLE_FILE)
		mock_load_single.assert_called_once()

	@patch('app.cores.model_loader.strategies._load_pretrained')
	def test_calls_load_pretrained(self, mock_load_pretrained: Mock) -> None:
		strategy = PretrainedStrategy(use_safetensors=True)
		_load_strategy_pipeline('id', strategy, ModelLoadingStrategy.PRETRAINED)
		mock_load_pretrained.assert_called_once()

	def test_raises_error_missing_checkpoint_path(self) -> None:
		strategy = SingleFileStrategy(checkpoint_path='')
		with pytest.raises(ValueError, match='Missing checkpoint path'):
			_load_strategy_pipeline('id', strategy, ModelLoadingStrategy.SINGLE_FILE)


class TestExecuteLoadingStrategies:
	@patch('app.cores.model_loader.strategies._load_strategy_pipeline')
	@patch('app.cores.model_loader.strategies.emit_step')
	def test_executes_strategies_until_success(self, mock_emit: Mock, mock_load: Mock) -> None:
		strategies: list[Strategy] = [PretrainedStrategy(use_safetensors=True)]
		mock_pipe = Mock()
		mock_load.return_value = mock_pipe

		result = execute_loading_strategies('id', strategies, None)
		assert result is mock_pipe

	@patch('app.cores.model_loader.strategies._load_strategy_pipeline')
	@patch('app.cores.model_loader.strategies.emit_step')
	@patch('app.cores.model_loader.strategies.socket_service')
	def test_raises_runtime_error_when_all_fail(self, mock_socket: Mock, mock_emit: Mock, mock_load: Mock) -> None:
		strategies: list[Strategy] = [PretrainedStrategy(use_safetensors=True)]
		mock_load.side_effect = RuntimeError('Load failed')

		with pytest.raises(RuntimeError, match='Load failed'):
			execute_loading_strategies('id', strategies, None)

		mock_socket.model_load_failed.assert_called_once()
