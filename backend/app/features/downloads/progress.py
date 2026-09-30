import logging
import threading
import time
from typing import Any, Optional

from tqdm import tqdm as BaseTqdm
from typing_extensions import override

from app.schemas.downloads import DownloadPhase, DownloadProgressCache, DownloadStepProgressResponse
from app.socket import socket_service


class ChunkEmitter:
	"""Background worker that coalesces chunk events before emitting over the socket."""

	def __init__(self, interval: float = 0.25):
		self.interval = interval
		self.lock = threading.Lock()
		self.latest = DownloadProgressCache()
		self.event = threading.Event()
		self.thread = threading.Thread(
			target=self.drain,
			name='download-progress-emitter',
			daemon=True,
		)
		self.thread.start()

	def enqueue(self, payload: DownloadStepProgressResponse) -> None:
		with self.lock:
			self.latest.upsert(payload)
			self.event.set()

	def flush(self, model_id: str) -> None:
		with self.lock:
			payload = self.latest.pop(model_id)
			if not self.latest:
				self.event.clear()
		if payload is not None:
			self.emit(payload)

	def drain(self) -> None:
		while True:
			self.event.wait()
			time.sleep(self.interval)
			with self.lock:
				payloads = self.latest.pop_all()
				if not payloads:
					self.event.clear()
					continue
				self.event.clear()
			for payload in payloads:
				self.emit(payload)

	def emit(self, payload: DownloadStepProgressResponse) -> None:
		try:
			socket_service.download_step_progress(payload)
		except Exception:  # pragma: no cover - guard against socket errors
			# Logging lives inside socket_service; avoid double-logging here.
			pass


chunk_emitter = ChunkEmitter()


class DownloadProgress(BaseTqdm):
	"""
	tqdm wrapper that emits websocket payloads describing byte-level progress.

	A download remains at the same step until a file completes. Each chunk emit
	carries cumulative bytes so the UI can render an accurate percentage.
	"""

	def __init__(self, *args: Any, **kwargs: Any) -> None:
		self.id: str = kwargs.pop('id')
		self.desc: str = kwargs.pop('desc')
		self.file_sizes: list[int] = kwargs.pop('file_sizes')
		self.logger: logging.Logger = kwargs.pop('logger')
		self.downloaded_size: int = 0
		self.total_downloaded_size: int = sum(self.file_sizes)
		self.completed_files_size: int = 0
		self.current_file: Optional[str] = None

		# Throttling to prevent websocket spam (huge performance boost)
		self.last_emit_time: float = time.time()
		self.last_emit_size: int = 0
		self.emit_interval: float = 0.5  # Emit at most every 0.5 seconds
		self.emit_size_threshold: int = 50 * 1024 * 1024  # Or every 50MB downloaded

		kwargs.setdefault('disable', None)
		kwargs.setdefault('mininterval', 0.25)
		kwargs.setdefault('leave', False)

		super().__init__(*args, **kwargs)
		self.emit_progress(DownloadPhase.INIT)

	def emit_progress(self, phase: DownloadPhase, *, current_file: Optional[str] = None) -> None:
		"""Push the latest cumulative byte totals to all websocket clients."""
		payload = DownloadStepProgressResponse(
			model_id=self.id,
			step=self.n,
			total=self.total,
			downloaded_size=self.downloaded_size,
			total_downloaded_size=self.total_downloaded_size,
			phase=phase,
			current_file=current_file or self.current_file,
		)

		if phase == DownloadPhase.CHUNK:
			chunk_emitter.enqueue(payload)
		else:
			chunk_emitter.flush(self.id)
			socket_service.download_step_progress(payload)

		if phase in {DownloadPhase.FILE_START, DownloadPhase.FILE_COMPLETE}:
			self.logger.info('%s %s/%s', self.desc, self.n, self.total)

	def start_file(self, filename: str) -> None:
		"""Mark the beginning of a file download so the UI can show file-level progress."""
		self.current_file = filename
		self.emit_progress(DownloadPhase.FILE_START, current_file=filename)

	def register_existing_bytes(self, byte_count: int) -> None:
		"""Register bytes that were already present on disk (resumed download)."""
		if byte_count <= 0:
			return

		self.downloaded_size += byte_count
		if self.total_downloaded_size > 0 and self.downloaded_size > self.total_downloaded_size:
			self.downloaded_size = self.total_downloaded_size

		self.logger.info(f'Resuming download with {byte_count} existing bytes')
		# Emit immediately so UI updates to the resumed percentage
		self.emit_progress(DownloadPhase.CHUNK)

	def set_file_size(self, index: int, size: int) -> None:
		"""Update the recorded size for a file and adjust totals accordingly."""
		if index < 0 or index >= len(self.file_sizes):
			return

		size = max(size, 0)
		previous = self.file_sizes[index]

		if previous == size:
			return

		delta = size - previous
		self.file_sizes[index] = size
		self.total_downloaded_size += delta
		if self.total_downloaded_size < 0:
			self.total_downloaded_size = 0

		if index < self.n:
			self.completed_files_size += delta
			if self.completed_files_size < 0:
				self.completed_files_size = 0

		self.emit_progress(DownloadPhase.SIZE_UPDATE)

	def update_bytes(self, byte_count: int) -> None:
		"""Increment downloaded bytes and emit progress for partial file download."""
		if byte_count <= 0:
			return

		self.downloaded_size += byte_count
		if self.total_downloaded_size > 0 and self.downloaded_size > self.total_downloaded_size:
			self.downloaded_size = self.total_downloaded_size

		# Throttle emissions: only emit every 0.5s OR every 50MB (whichever comes first)
		# This prevents websocket spam and dramatically improves download speed
		now = time.time()
		size_delta = self.downloaded_size - self.last_emit_size
		time_delta = now - self.last_emit_time

		if size_delta >= self.emit_size_threshold or time_delta >= self.emit_interval:
			self.emit_progress(DownloadPhase.CHUNK)
			self.last_emit_time = now
			self.last_emit_size = self.downloaded_size

	@override
	def update(self, n: Optional[float] = 1) -> Optional[bool]:
		step = 1 if n is None else n
		result = super().update(step)
		start_index = max(0, int(self.n - step))
		end_index = self.n
		for i in range(start_index, end_index):
			if i < len(self.file_sizes):
				self.completed_files_size += self.file_sizes[i]

		if self.downloaded_size < self.completed_files_size:
			self.downloaded_size = self.completed_files_size

		self.emit_progress(DownloadPhase.FILE_COMPLETE)

		return result

	@override
	def close(self):
		"""Close the progress bar and emit final completion event."""
		self.emit_progress(DownloadPhase.COMPLETE)
		super().close()
