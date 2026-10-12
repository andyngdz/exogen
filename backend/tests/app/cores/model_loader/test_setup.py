"""Tests for the model loader setup module."""

from __future__ import annotations

from typing import Any
from unittest.mock import Mock, patch

from app.cores.model_loader.cancellation import CancellationToken
from app.cores.model_loader.setup import (
	apply_device_optimizations,
	cleanup_partial_load,
	finalize_model_setup,
	move_to_device,
)
from app.services.device import DeviceType


def return_first_arg(arg: Any, *args: Any, **kwargs: Any) -> Any:
	return arg


class TestApplyDeviceOptimizations:
	@patch('app.cores.model_loader.setup.get_optimizer')
	def test_applies_optimizer_to_pipeline(self, mock_get_optimizer: Mock) -> None:
		mock_optimizer = Mock()
		mock_optimizer.get_platform_name.return_value = 'TestPlatform'
		mock_get_optimizer.return_value = mock_optimizer
		mock_pipe = Mock()

		apply_device_optimizations(mock_pipe)

		mock_optimizer.apply.assert_called_once_with(mock_pipe)
		mock_optimizer.get_platform_name.assert_called_once()


class TestMoveToDevice:
	def test_uses_to_empty_when_available(self) -> None:
		mock_pipe = Mock()
		mock_pipe.to_empty.return_value = mock_pipe

		result = move_to_device(mock_pipe, 'cuda', 'Test pipeline')

		mock_pipe.to_empty.assert_called_once_with('cuda')
		mock_pipe.to.assert_not_called()
		assert result is mock_pipe

	def test_falls_back_to_to_when_to_empty_not_available(self) -> None:
		mock_pipe = Mock()
		mock_pipe.to_empty.side_effect = AttributeError('to_empty not available')
		mock_pipe.to.return_value = mock_pipe

		result = move_to_device(mock_pipe, 'cuda', 'Test pipeline')

		mock_pipe.to.assert_called_once_with('cuda')
		assert result is mock_pipe

	def test_falls_back_to_to_when_to_empty_raises_type_error(self) -> None:
		mock_pipe = Mock()
		mock_pipe.to_empty.side_effect = TypeError('Invalid type')
		mock_pipe.to.return_value = mock_pipe

		result = move_to_device(mock_pipe, 'cpu', 'Test pipeline')

		mock_pipe.to.assert_called_once_with('cpu')
		assert result is mock_pipe


class TestCleanupPartialLoad:
	def test_skips_cleanup_when_pipe_is_none(self) -> None:
		cleanup_partial_load(None)

	@patch('app.cores.model_loader.setup.cleanup_gpu_model')
	def test_cleans_up_pipeline_resources(self, mock_cleanup: Mock) -> None:
		mock_metrics = Mock()
		mock_metrics.time_ms = 100.5
		mock_metrics.objects_collected = 42
		mock_metrics.error = None
		mock_cleanup.return_value = mock_metrics

		mock_pipe = Mock()

		cleanup_partial_load(mock_pipe)

		mock_cleanup.assert_called_once_with(mock_pipe, name='partial pipeline')

	@patch('app.cores.model_loader.setup.cleanup_gpu_model')
	def test_logs_cleanup_with_error(self, mock_cleanup: Mock) -> None:
		mock_metrics = Mock()
		mock_metrics.time_ms = 50.0
		mock_metrics.objects_collected = 10
		mock_metrics.error = 'Cleanup error'
		mock_cleanup.return_value = mock_metrics

		mock_pipe = Mock()

		cleanup_partial_load(mock_pipe)

		mock_cleanup.assert_called_once_with(mock_pipe, name='partial pipeline')


class TestFinalizeModelSetup:
	@patch('app.cores.model_loader.setup.apply_device_optimizations')
	@patch('app.cores.model_loader.setup.move_to_device', side_effect=return_first_arg)
	@patch('app.cores.model_loader.setup.emit_step')
	@patch('app.cores.model_loader.setup.device_service')
	def test_finalizes_setup_successfully(
		self,
		mock_device_service: Mock,
		mock_emit: Mock,
		mock_move: Mock,
		mock_optimize: Mock,
	) -> None:
		mock_device_service.device = DeviceType.CUDA
		mock_pipe = Mock()
		mock_pipe.reset_device_map = Mock()

		result = finalize_model_setup(mock_pipe, 'model-id', None)

		assert result is mock_pipe
		mock_pipe.reset_device_map.assert_called_once()
		mock_move.assert_called_once_with(mock_pipe, 'cuda', 'Pipeline model-id')
		mock_optimize.assert_called_once_with(mock_pipe)
		assert mock_emit.call_count == 4  # steps 5, 6, 7, 8

	@patch('app.cores.model_loader.setup.apply_device_optimizations')
	@patch('app.cores.model_loader.setup.move_to_device', side_effect=return_first_arg)
	@patch('app.cores.model_loader.setup.emit_step')
	@patch('app.cores.model_loader.setup.device_service')
	def test_checks_cancellation_at_each_step(
		self,
		mock_device_service: Mock,
		mock_emit: Mock,
		mock_move: Mock,
		mock_optimize: Mock,
	) -> None:
		mock_device_service.device = DeviceType.CUDA
		mock_pipe = Mock()
		cancel_token = Mock(spec=CancellationToken)

		finalize_model_setup(mock_pipe, 'model-id', cancel_token)

		# emit_step checks cancel_token internally, so 4 calls to emit_step = 4 cancel checks
		assert mock_emit.call_count == 4

	@patch('app.cores.model_loader.setup.apply_device_optimizations')
	@patch('app.cores.model_loader.setup.move_to_device', side_effect=return_first_arg)
	@patch('app.cores.model_loader.setup.emit_step')
	@patch('app.cores.model_loader.setup.device_service')
	def test_handles_pipeline_without_reset_device_map(
		self,
		mock_device_service: Mock,
		mock_emit: Mock,
		mock_move: Mock,
		mock_optimize: Mock,
	) -> None:
		mock_device_service.device = DeviceType.CUDA
		mock_pipe = Mock(spec=['to', 'to_empty'])
		# Ensure no reset_device_map attribute
		del mock_pipe.reset_device_map

		result = finalize_model_setup(mock_pipe, 'model-id', None)

		assert result is mock_pipe
		mock_move.assert_called_once()
		mock_optimize.assert_called_once()
