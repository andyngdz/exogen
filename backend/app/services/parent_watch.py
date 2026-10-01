import asyncio
import signal

import psutil

from app.services.logger import logger_service

logger = logger_service.get_logger(__name__, category='ParentWatch')

PARENT_PID_ENV = 'EXOGEN_PARENT_PID'
CHECK_INTERVAL_SECONDS = 2.0


class ParentWatchService:
	"""Shuts the backend down when the app process that launched it is gone.

	The app stops the backend on a normal quit, but a crash or kill -9 skips
	that path and would leave the backend holding the port and GPU memory.
	"""

	def __init__(self, interval_seconds: float = CHECK_INTERVAL_SECONDS):
		self.interval_seconds = interval_seconds

	def parse_parent_pid(self, raw: str | None) -> int | None:
		"""Return the PID from the env value, or None when unset or not a positive integer."""
		if not raw or not raw.isdigit():
			return None

		parent_pid = int(raw)
		return parent_pid if parent_pid > 0 else None

	def start(self, parent_pid: int) -> asyncio.Task[None] | None:
		"""Start watching `parent_pid`; returns None when that process is already gone."""
		try:
			parent = psutil.Process(parent_pid)
		except psutil.NoSuchProcess:
			logger.warning('App process not found, shutting down')
			signal.raise_signal(signal.SIGTERM)
			return None

		return asyncio.create_task(self._watch(parent))

	async def _watch(self, parent: psutil.Process) -> None:
		while self._is_alive(parent):
			await asyncio.sleep(self.interval_seconds)

		logger.warning('App process is gone, shutting down')
		# uvicorn traps SIGTERM and runs the normal lifespan shutdown.
		signal.raise_signal(signal.SIGTERM)

	def _is_alive(self, parent: psutil.Process) -> bool:
		# is_running() also compares the start time, so a reused PID counts as gone.
		try:
			return parent.is_running() and parent.status() != psutil.STATUS_ZOMBIE
		except psutil.NoSuchProcess:
			return False


parent_watch_service = ParentWatchService()
