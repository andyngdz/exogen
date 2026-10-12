"""Tests for model loader steps module."""

from unittest.mock import Mock, patch

from app.cores.model_loader.steps import (
	STEP_CONFIG,
	TOTAL_STEPS,
	ModelLoadStep,
	emit_step,
)
from app.schemas.model_loader import ModelLoadPhase


class TestModelLoadStep:
	"""Test ModelLoadStep enum."""

	def test_has_8_members(self):
		"""Test that enum has exactly 8 members."""
		assert len(ModelLoadStep) == 8

	def test_values_are_sequential(self):
		"""Test that step values are 1 through 8."""
		expected = [1, 2, 3, 4, 5, 6, 7, 8]
		actual = [step.value for step in ModelLoadStep]
		assert actual == expected

	def test_step_names(self):
		"""Test that all expected step names exist."""
		expected_names = [
			'INIT',
			'CACHE_CHECK',
			'BUILD_STRATEGIES',
			'LOAD_WEIGHTS',
			'LOAD_COMPLETE',
			'MOVE_TO_DEVICE',
			'APPLY_OPTIMIZATIONS',
			'FINALIZE',
		]
		actual_names = [step.name for step in ModelLoadStep]
		assert actual_names == expected_names


class TestTotalSteps:
	"""Test TOTAL_STEPS constant."""

	def test_equals_8(self):
		"""Test that TOTAL_STEPS is 8."""
		assert TOTAL_STEPS == 8

	def test_matches_enum_length(self):
		"""Test that TOTAL_STEPS equals enum member count."""
		assert TOTAL_STEPS == len(ModelLoadStep)


class TestStepConfig:
	"""Test STEP_CONFIG mapping."""

	def test_has_entry_for_each_step(self):
		"""Test that every step has a config entry."""
		for step in ModelLoadStep:
			assert step in STEP_CONFIG, f'Missing config for {step.name}'

	def test_entries_are_tuples_of_message_and_phase(self):
		"""Test that each entry is (message, phase) tuple."""
		for step, config in STEP_CONFIG.items():
			assert isinstance(config, tuple), f'{step.name} config is not a tuple'
			assert len(config) == 2, f'{step.name} config should have 2 elements'
			message, phase = config
			assert isinstance(message, str), f'{step.name} message should be string'
			assert isinstance(phase, ModelLoadPhase), f'{step.name} phase should be ModelLoadPhase'

	def test_messages_are_non_empty(self):
		"""Test that all messages are non-empty strings."""
		for step, (message, _) in STEP_CONFIG.items():
			assert message, f'{step.name} has empty message'


class TestEmitStep:
	"""Test emit_step function."""

	@patch('app.cores.model_loader.steps.socket_service')
	@patch('app.cores.model_loader.steps.logger')
	def test_emits_progress_with_correct_payload(self, mock_logger, mock_socket):
		"""Test that emit_step sends correct progress payload."""
		emit_step('test-model', ModelLoadStep.INIT)

		mock_socket.model_load_progress.assert_called_once()
		progress = mock_socket.model_load_progress.call_args[0][0]

		assert progress.model_id == 'test-model'
		assert progress.step == 1
		assert progress.total == TOTAL_STEPS
		assert progress.phase == ModelLoadPhase.INITIALIZATION
		assert progress.message == 'Initializing model loader...'

	@patch('app.cores.model_loader.steps.socket_service')
	@patch('app.cores.model_loader.steps.logger')
	def test_logs_progress(self, mock_logger, mock_socket):
		"""Test that emit_step logs progress info."""
		emit_step('test-model', ModelLoadStep.LOAD_WEIGHTS)

		mock_logger.info.assert_called_once()
		log_message = mock_logger.info.call_args[0][0]
		assert 'test-model' in log_message
		assert 'step=4' in log_message

	@patch('app.cores.model_loader.steps.socket_service')
	@patch('app.cores.model_loader.steps.logger')
	def test_checks_cancellation_token(self, mock_logger, mock_socket):
		"""Test that cancel_token is checked if provided."""
		mock_token = Mock()

		emit_step('test-model', ModelLoadStep.INIT, mock_token)

		mock_token.check_cancelled.assert_called_once()

	@patch('app.cores.model_loader.steps.socket_service')
	@patch('app.cores.model_loader.steps.logger')
	def test_works_without_cancel_token(self, mock_logger, mock_socket):
		"""Test that emit_step works when cancel_token is None."""
		emit_step('test-model', ModelLoadStep.FINALIZE, None)

		mock_socket.model_load_progress.assert_called_once()

	@patch('app.cores.model_loader.steps.socket_service')
	@patch('app.cores.model_loader.steps.logger')
	def test_handles_socket_error_gracefully(self, mock_logger, mock_socket):
		"""Test that socket errors are caught and logged."""
		mock_socket.model_load_progress.side_effect = Exception('Socket error')

		# Should not raise
		emit_step('test-model', ModelLoadStep.INIT)

		mock_logger.warning.assert_called_once()
		warning_msg = mock_logger.warning.call_args[0][0]
		assert 'Failed to emit' in warning_msg
