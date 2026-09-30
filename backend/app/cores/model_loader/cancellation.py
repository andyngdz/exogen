"""Cancellation token for aborting long-running model loading operations."""

import threading
from dataclasses import dataclass, field


class CancellationException(Exception):
	"""Raised when an operation is cancelled."""

	pass


class DuplicateLoadRequestError(Exception):
	"""Raised when the same model is already being loaded."""

	pass


@dataclass
class CancellationToken:
	"""Thread-safe token for cancelling long-running operations.

	This token allows cooperative cancellation of model loading operations.
	The loading code checks the token at regular intervals and raises
	CancellationException if cancellation is requested.
	"""

	_cancelled: bool = field(default=False, init=False)
	_lock: threading.Lock = field(default_factory=threading.Lock, init=False)

	def cancel(self) -> None:
		"""Request cancellation of the operation."""
		with self._lock:
			self._cancelled = True

	def is_cancelled(self) -> bool:
		"""Check if cancellation has been requested.

		Returns:
			True if cancellation requested, False otherwise.
		"""
		with self._lock:
			return self._cancelled

	def check_cancelled(self) -> None:
		"""Check if cancelled and raise exception if so.

		Raises:
			CancellationException: If cancellation has been requested.
		"""
		if self.is_cancelled():
			raise CancellationException('Operation cancelled')
