"""Type stubs for python-socketio library.

This module provides type hints for the socketio library APIs used in this project.
"""

from typing import Literal

from starlette.types import Receive, Scope, Send

class AsyncServer:
	"""Socket.IO AsyncServer for ASGI applications."""

	def __init__(
		self,
		*,
		async_mode: Literal['asgi'] = 'asgi',
		cors_allowed_origins: str | list[str] = '*',
		logger: bool = False,
		**kwargs,
	) -> None:
		"""Initialize AsyncServer with ASGI mode."""
		...

	async def emit(
		self,
		event: str,
		data: dict | None = None,
		**kwargs,
	) -> None:
		"""Emit an event to all connected clients."""
		...

class ASGIApp:
	"""ASGI application wrapper for Socket.IO server.

	This class implements the ASGI3 protocol and is compatible with starlette.types.ASGIApp.
	"""

	def __init__(self, socketio_server: AsyncServer, **kwargs) -> None:
		"""Wrap AsyncServer as ASGI application."""
		...

	async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
		"""ASGI3 application callable interface."""
		...
