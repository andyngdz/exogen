"""Comprehensive tests for StateManager class.

This test suite covers:
1. State retrieval (current_state property)
2. State transitions (set_state) with all StateTransitionReason values
3. State transition validation (can_transition_to)
4. Edge cases (ERROR recovery)
"""

import logging

from app.cores.model_manager.state_manager import ModelState, StateManager, StateTransitionReason


class TestGetState:
	"""Test get_state() method."""

	def setup_method(self):
		"""Create fresh StateManager for each test."""
		self.state_manager = StateManager()

	def test_get_state_returns_initial_idle_state(self):
		"""Test that get_state returns IDLE on initialization."""
		assert self.state_manager.current_state == ModelState.IDLE

	def test_get_state_returns_current_state_after_transition(self):
		"""Test that get_state reflects state changes."""
		self.state_manager._state = ModelState.LOADING
		assert self.state_manager.current_state == ModelState.LOADING

		self.state_manager._state = ModelState.LOADED
		assert self.state_manager.current_state == ModelState.LOADED


class TestSetState:
	"""Test set_state() method with all StateTransitionReason values."""

	def setup_method(self):
		"""Create fresh StateManager for each test."""
		self.state_manager = StateManager()

	def test_set_state_updates_state(self):
		"""Test that set_state updates the internal state."""
		assert self.state_manager._state == ModelState.IDLE

		self.state_manager.set_state(ModelState.LOADING, StateTransitionReason.LOAD_REQUESTED)
		assert self.state_manager._state == ModelState.LOADING

	def test_set_state_logs_transition_with_reason(self, caplog):
		"""Test that set_state logs state transitions with reason."""
		caplog.set_level(logging.INFO)

		self.state_manager.set_state(ModelState.LOADING, StateTransitionReason.LOAD_REQUESTED)

		assert 'Model state: idle → load requested' in caplog.text

	def test_set_state_load_transitions(self, caplog):
		"""Test all load-related state transitions."""
		caplog.set_level(logging.INFO)

		# IDLE → LOADING (load requested)
		self.state_manager.set_state(ModelState.LOADING, StateTransitionReason.LOAD_REQUESTED)
		assert 'idle → load requested' in caplog.text
		caplog.clear()

		# LOADING → LOADED (load completed)
		self.state_manager.set_state(ModelState.LOADED, StateTransitionReason.LOAD_COMPLETED)
		assert 'loading → load completed successfully' in caplog.text

	def test_set_state_load_failure_transitions(self, caplog):
		"""Test load failure state transitions."""
		caplog.set_level(logging.INFO)

		# IDLE → LOADING
		self.state_manager.set_state(ModelState.LOADING, StateTransitionReason.LOAD_REQUESTED)
		caplog.clear()

		# LOADING → ERROR (load failed)
		self.state_manager.set_state(ModelState.ERROR, StateTransitionReason.LOAD_FAILED)
		assert 'loading → load failed with error' in caplog.text

	def test_set_state_load_cancellation_transitions(self, caplog):
		"""Test load cancellation state transitions."""
		caplog.set_level(logging.INFO)

		# IDLE → LOADING
		self.state_manager.set_state(ModelState.LOADING, StateTransitionReason.LOAD_REQUESTED)
		caplog.clear()

		# LOADING → IDLE (load cancelled)
		self.state_manager.set_state(ModelState.IDLE, StateTransitionReason.LOAD_CANCELLED)
		assert 'loading → load cancelled by user' in caplog.text

	def test_set_state_unload_transitions(self, caplog):
		"""Test all unload-related state transitions."""
		caplog.set_level(logging.INFO)

		# Setup: get to LOADED state
		self.state_manager._state = ModelState.LOADED

		# LOADED → UNLOADING (unload requested)
		self.state_manager.set_state(ModelState.UNLOADING, StateTransitionReason.UNLOAD_REQUESTED)
		assert 'loaded → unload requested' in caplog.text
		caplog.clear()

		# UNLOADING → IDLE (unload completed)
		self.state_manager.set_state(ModelState.IDLE, StateTransitionReason.UNLOAD_COMPLETED)
		assert 'unloading → unload completed successfully' in caplog.text

	def test_set_state_unload_failure_transitions(self, caplog):
		"""Test unload failure state transitions."""
		caplog.set_level(logging.INFO)

		# Setup: get to UNLOADING state
		self.state_manager._state = ModelState.UNLOADING

		# UNLOADING → ERROR (unload failed)
		self.state_manager.set_state(ModelState.ERROR, StateTransitionReason.UNLOAD_FAILED)
		assert 'unloading → unload failed with error' in caplog.text

	def test_set_state_error_recovery_transitions(self, caplog):
		"""Test error recovery state transitions."""
		caplog.set_level(logging.INFO)

		# ERROR → IDLE (reset from error)
		self.state_manager._state = ModelState.ERROR
		self.state_manager.set_state(ModelState.IDLE, StateTransitionReason.RESET_FROM_ERROR)
		assert 'error → reset from error state' in caplog.text


class TestCanTransitionTo:
	"""Test can_transition_to() state validation method."""

	def setup_method(self):
		"""Create fresh StateManager for each test."""
		self.state_manager = StateManager()

	def test_idle_can_transition_to_loading(self):
		"""Test IDLE → LOADING is valid."""
		self.state_manager._state = ModelState.IDLE
		assert self.state_manager.can_transition_to(ModelState.LOADING) is True

	def test_idle_cannot_transition_to_loaded(self):
		"""Test IDLE → LOADED is invalid."""
		self.state_manager._state = ModelState.IDLE
		assert self.state_manager.can_transition_to(ModelState.LOADED) is False

	def test_idle_cannot_transition_to_unloading(self):
		"""Test IDLE → UNLOADING is invalid."""
		self.state_manager._state = ModelState.IDLE
		assert self.state_manager.can_transition_to(ModelState.UNLOADING) is False

	def test_loading_can_transition_to_loaded(self):
		"""Test LOADING → LOADED is valid."""
		self.state_manager._state = ModelState.LOADING
		assert self.state_manager.can_transition_to(ModelState.LOADED) is True

	def test_loading_can_transition_to_idle(self):
		"""Test LOADING → IDLE is valid (cancellation)."""
		self.state_manager._state = ModelState.LOADING
		assert self.state_manager.can_transition_to(ModelState.IDLE) is True

	def test_loading_can_transition_to_error(self):
		"""Test LOADING → ERROR is valid."""
		self.state_manager._state = ModelState.LOADING
		assert self.state_manager.can_transition_to(ModelState.ERROR) is True

	def test_loading_cannot_transition_to_unloading(self):
		"""Test LOADING → UNLOADING is invalid."""
		self.state_manager._state = ModelState.LOADING
		assert self.state_manager.can_transition_to(ModelState.UNLOADING) is False

	def test_loaded_can_transition_to_unloading(self):
		"""Test LOADED → UNLOADING is valid."""
		self.state_manager._state = ModelState.LOADED
		assert self.state_manager.can_transition_to(ModelState.UNLOADING) is True

	def test_loaded_cannot_transition_to_loading(self):
		"""Test LOADED → LOADING is invalid."""
		self.state_manager._state = ModelState.LOADED
		assert self.state_manager.can_transition_to(ModelState.LOADING) is False

	def test_loaded_cannot_transition_to_idle(self):
		"""Test LOADED → IDLE is invalid (must unload first)."""
		self.state_manager._state = ModelState.LOADED
		assert self.state_manager.can_transition_to(ModelState.IDLE) is False

	def test_unloading_can_transition_to_idle(self):
		"""Test UNLOADING → IDLE is valid."""
		self.state_manager._state = ModelState.UNLOADING
		assert self.state_manager.can_transition_to(ModelState.IDLE) is True

	def test_unloading_can_transition_to_error(self):
		"""Test UNLOADING → ERROR is valid."""
		self.state_manager._state = ModelState.UNLOADING
		assert self.state_manager.can_transition_to(ModelState.ERROR) is True

	def test_unloading_cannot_transition_to_loading(self):
		"""Test UNLOADING → LOADING is invalid."""
		self.state_manager._state = ModelState.UNLOADING
		assert self.state_manager.can_transition_to(ModelState.LOADING) is False

	def test_error_can_transition_to_idle(self):
		"""Test ERROR → IDLE is valid (recovery)."""
		self.state_manager._state = ModelState.ERROR
		assert self.state_manager.can_transition_to(ModelState.IDLE) is True

	def test_error_can_transition_to_loading(self):
		"""Test ERROR → LOADING is valid (retry)."""
		self.state_manager._state = ModelState.ERROR
		assert self.state_manager.can_transition_to(ModelState.LOADING) is True

	def test_error_cannot_transition_to_loaded(self):
		"""Test ERROR → LOADED is invalid."""
		self.state_manager._state = ModelState.ERROR
		assert self.state_manager.can_transition_to(ModelState.LOADED) is False


class TestStateTransitionEdgeCases:
	"""Test edge cases and complete state transition flows."""

	def setup_method(self):
		"""Create fresh StateManager for each test."""
		self.state_manager = StateManager()

	def test_successful_load_flow(self):
		"""Test complete successful load flow: IDLE → LOADING → LOADED."""
		assert self.state_manager.current_state == ModelState.IDLE
		assert self.state_manager.can_transition_to(ModelState.LOADING) is True

		self.state_manager.set_state(ModelState.LOADING, StateTransitionReason.LOAD_REQUESTED)
		assert self.state_manager.current_state == ModelState.LOADING
		assert self.state_manager.can_transition_to(ModelState.LOADED) is True

		self.state_manager.set_state(ModelState.LOADED, StateTransitionReason.LOAD_COMPLETED)
		assert self.state_manager.current_state == ModelState.LOADED

	def test_load_and_unload_flow(self):
		"""Test complete load/unload flow: IDLE → LOADING → LOADED → UNLOADING → IDLE."""
		self.state_manager.set_state(ModelState.LOADING, StateTransitionReason.LOAD_REQUESTED)
		self.state_manager.set_state(ModelState.LOADED, StateTransitionReason.LOAD_COMPLETED)
		self.state_manager.set_state(ModelState.UNLOADING, StateTransitionReason.UNLOAD_REQUESTED)
		self.state_manager.set_state(ModelState.IDLE, StateTransitionReason.UNLOAD_COMPLETED)

		assert self.state_manager.current_state == ModelState.IDLE

	def test_load_cancellation_flow(self):
		"""Test load cancellation flow: IDLE → LOADING → IDLE."""
		self.state_manager.set_state(ModelState.LOADING, StateTransitionReason.LOAD_REQUESTED)
		self.state_manager.set_state(ModelState.IDLE, StateTransitionReason.LOAD_CANCELLED)

		assert self.state_manager.current_state == ModelState.IDLE

	def test_load_error_recovery_flow(self):
		"""Test error recovery flow: IDLE → LOADING → ERROR → IDLE."""
		self.state_manager.set_state(ModelState.LOADING, StateTransitionReason.LOAD_REQUESTED)
		self.state_manager.set_state(ModelState.ERROR, StateTransitionReason.LOAD_FAILED)

		assert self.state_manager.can_transition_to(ModelState.IDLE) is True
		self.state_manager.set_state(ModelState.IDLE, StateTransitionReason.RESET_FROM_ERROR)

		assert self.state_manager.current_state == ModelState.IDLE

	def test_error_retry_flow(self):
		"""Test retry after error: ERROR → LOADING → LOADED."""
		self.state_manager._state = ModelState.ERROR

		assert self.state_manager.can_transition_to(ModelState.LOADING) is True
		self.state_manager.set_state(ModelState.LOADING, StateTransitionReason.LOAD_REQUESTED)
		self.state_manager.set_state(ModelState.LOADED, StateTransitionReason.LOAD_COMPLETED)

		assert self.state_manager.current_state == ModelState.LOADED
