import asyncio
from typing import Any, Dict, Optional

import socketio
from pydantic import BaseModel
from starlette.types import ASGIApp

from app.schemas.socket import SocketEvents
from app.services.logger import logger_service

logger = logger_service.get_logger(__name__, category='Socket')


class SocketService:
	"""
	Service for handling socket events with proper async/sync support.

	This service provides methods to emit socket events both synchronously
	and asynchronously, with proper event loop handling.
	"""

	def __init__(self) -> None:
		"""Initialize the socket service with an AsyncServer."""
		self.loop: Optional[asyncio.AbstractEventLoop] = None
		self.sio = socketio.AsyncServer(
			async_mode='asgi',
			cors_allowed_origins='*',
			logger=False,
		)
		self.sio_app: ASGIApp = socketio.ASGIApp(self.sio)
		logger.info('SocketService initialized.')

	def attach_loop(self, loop: asyncio.AbstractEventLoop) -> None:
		"""
		Attach the running ASGI event loop used for thread-safe emits.

		Args:
			loop: The event loop to attach
		"""
		self.loop = loop
		logger.info('SocketService attached to loop: %s', loop)

	async def emit(self, event: SocketEvents, data: Dict[str, Any]) -> None:
		"""
		Emit an event asynchronously to all connected clients.

		Args:
			event: The socket event to emit
			data: The data to send with the event
		"""
		await self.sio.emit(event, data=data)

	def emit_sync(self, event: SocketEvents, data: Dict[str, Any]) -> None:
		"""
		Emit an event synchronously to all connected clients.

		This schedules the emit coroutine onto the attached running loop.

		Args:
			event: The socket event to emit
			data: The data to send with the event
		"""
		target_loop = self.get_event_loop()
		if target_loop is None:
			logger.warning('No event loop available; dropping socket emit for %s', event)
			return

		asyncio.run_coroutine_threadsafe(
			self.sio.emit(event, data=data),
			loop=target_loop,
		)

	def get_event_loop(self) -> Optional[asyncio.AbstractEventLoop]:
		"""
		Get an appropriate event loop for synchronous emits.

		Returns:
			An event loop or None if no loop is available
		"""
		# Use cached loop if available
		if self.loop is not None and not self.loop.is_closed():
			return self.loop

		# Try to get a running loop first (if called from an async context)
		try:
			loop = asyncio.get_running_loop()
			self.loop = loop  # Cache for subsequent calls
			return loop
		except RuntimeError:
			pass

		# Fall back to the current event loop (may not be running in tests)
		try:
			loop = asyncio.new_event_loop()
			self.loop = loop  # Cache for subsequent calls
			return loop
		except RuntimeError:
			return None

	# Async event methods

	async def download_start(self, data: BaseModel) -> None:
		"""
		Emit a download start event with the provided data.

		Args:
			data: The data model to send
		"""
		await self.emit(SocketEvents.DOWNLOAD_START, data=data.model_dump())

	async def download_completed(self, data: BaseModel) -> None:
		"""
		Emit a download completed event with the provided data.

		Args:
			data: The data model to send
		"""
		await self.emit(SocketEvents.DOWNLOAD_COMPLETED, data=data.model_dump())

	# Sync event methods

	def download_step_progress(self, data: BaseModel) -> None:
		"""
		Emit a download step progress event synchronously with the provided data.

		Args:
			data: The data model to send
		"""
		self.emit_sync(SocketEvents.DOWNLOAD_STEP_PROGRESS, data=data.model_dump())

	def model_load_started(self, data: BaseModel) -> None:
		"""
		Emit a model load started event with the provided data.

		Args:
			data: The data model to send
		"""
		self.emit_sync(SocketEvents.MODEL_LOAD_STARTED, data=data.model_dump())

	def model_load_progress(self, data: BaseModel) -> None:
		"""
		Emit a model load progress event with the provided data.

		Args:
			data: The data model to send
		"""
		self.emit_sync(SocketEvents.MODEL_LOAD_PROGRESS, data=data.model_dump())

	def model_load_failed(self, data: BaseModel) -> None:
		"""
		Emit a model load failed event with the provided data.

		Args:
			data: The data model to send
		"""
		self.emit_sync(SocketEvents.MODEL_LOAD_FAILED, data=data.model_dump())

	def model_load_completed(self, data: BaseModel) -> None:
		"""
		Emit a model load completed event with the provided data.

		Args:
			data: The data model to send
		"""
		self.emit_sync(SocketEvents.MODEL_LOAD_COMPLETED, data=data.model_dump())

	def image_generation_step_end(self, data: BaseModel) -> None:
		"""
		Emit an image generation step end event with the provided data.

		Args:
			data: The data model to send
		"""
		self.emit_sync(SocketEvents.IMAGE_GENERATION_STEP_END, data=data.model_dump())

	def generation_phase(self, data: BaseModel) -> None:
		"""
		Emit a generation phase event with the provided data.

		Args:
			data: The data model to send (GenerationPhaseResponse)
		"""
		self.emit_sync(SocketEvents.GENERATION_PHASE, data=data.model_dump())


# Singleton instance for application-wide use
socket_service = SocketService()
