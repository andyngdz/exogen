"""Model loading state machine."""

from enum import Enum

from app.services import logger_service

logger = logger_service.get_logger(__name__, category='ModelLoad')


class ModelState(Enum):
	"""Model loading states for tracking operations."""

	IDLE = 'idle'
	LOADING = 'loading'
	LOADED = 'loaded'
	UNLOADING = 'unloading'
	ERROR = 'error'


class StateTransitionReason(Enum):
	"""Predefined reasons for state transitions."""

	LOAD_REQUESTED = 'load requested'
	LOAD_COMPLETED = 'load completed successfully'
	LOAD_FAILED = 'load failed with error'
	LOAD_CANCELLED = 'load cancelled by user'

	UNLOAD_REQUESTED = 'unload requested'
	UNLOAD_COMPLETED = 'unload completed successfully'
	UNLOAD_FAILED = 'unload failed with error'

	RESET_FROM_ERROR = 'reset from error state'


class StateManager:
	"""Manages model loading state transitions with validation.

	Note: This class is NOT thread-safe. Callers must use external locking
	(e.g., LoaderService.lock) when accessing from multiple threads/tasks.
	"""

	_VALID_TRANSITIONS = {
		ModelState.IDLE: {ModelState.LOADING},
		ModelState.LOADING: {ModelState.LOADED, ModelState.IDLE, ModelState.ERROR},
		ModelState.LOADED: {ModelState.UNLOADING},
		ModelState.UNLOADING: {ModelState.IDLE, ModelState.ERROR},
		ModelState.ERROR: {ModelState.IDLE, ModelState.LOADING},
	}

	def __init__(self) -> None:
		self._state: ModelState = ModelState.IDLE

	@property
	def current_state(self) -> ModelState:
		"""Get current model state.

		Returns:
			Current ModelState
		"""
		return self._state

	def set_state(self, new_state: ModelState, reason: StateTransitionReason) -> None:
		"""Set model state with logging.

		Args:
			new_state: New state to transition to
			reason: Predefined reason for transition
		"""
		old_state = self._state
		self._state = new_state
		logger.info(f'Model state: {old_state.value} → {reason.value}')

	def can_transition_to(self, target_state: ModelState) -> bool:
		"""Check if transition to target state is valid from current state.

		Args:
			target_state: State to transition to

		Returns:
			True if transition is valid, False otherwise
		"""
		return target_state in self._VALID_TRANSITIONS.get(self._state, set())


# Singleton instance
state_manager = StateManager()
