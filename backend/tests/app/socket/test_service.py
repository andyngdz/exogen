import asyncio
from typing import Any
from unittest.mock import AsyncMock, Mock, patch

import pytest
from pydantic import BaseModel, ConfigDict

from app.schemas.socket import SocketEvents
from app.socket.service import SocketService


class PayloadModel(BaseModel):
	"""Lightweight Pydantic model that accepts arbitrary fields."""

	model_config = ConfigDict(extra='allow')

	# Define all fields used across tests as optional
	model: str | None = None
	size: int | None = None
	total: int | None = None
	succeeded: int | None = None
	step: int | None = None
	of: int | None = None
	status: str | None = None
	phases: list[str] | None = None
	current: str | None = None


@pytest.mark.asyncio
async def test_emit_calls_sio_emit(monkeypatch: pytest.MonkeyPatch) -> None:
	# Arrange
	service = SocketService()
	mock_emit = AsyncMock(return_value=None)
	monkeypatch.setattr(service.sio, 'emit', mock_emit)
	event = SocketEvents.DOWNLOAD_START
	data = {'foo': 'bar'}

	# Act
	await service.emit(event, data)

	# Assert
	mock_emit.assert_awaited_once_with(event, data=data)
	# Close the custom loop created by SocketService to avoid unclosed loop warnings
	try:
		if service.loop and not service.loop.is_closed():
			service.loop.close()
	except Exception:
		pass


def test_emit_sync_schedules_coroutine_threadsafe(monkeypatch: pytest.MonkeyPatch) -> None:
	# Arrange
	test_loop = asyncio.new_event_loop()
	service = SocketService()
	mock_emit = AsyncMock(return_value=None)
	monkeypatch.setattr(service.sio, 'emit', mock_emit)

	# Mock get_event_loop to return our test loop
	mock_get_event_loop = Mock(return_value=test_loop)
	monkeypatch.setattr(service, 'get_event_loop', mock_get_event_loop)

	captured_args = {}

	def fake_run_coroutine_threadsafe(coro: Any, loop: asyncio.AbstractEventLoop) -> Mock:
		captured_args['coro'] = coro
		captured_args['loop'] = loop
		# Return a dummy Future-like object
		# Ensure the coroutine is executed to avoid "never awaited" warnings
		loop.run_until_complete(coro)
		fut = Mock()
		fut.cancelled.return_value = False
		fut.done.return_value = True
		return fut

	monkeypatch.setattr(asyncio, 'run_coroutine_threadsafe', fake_run_coroutine_threadsafe)

	event = SocketEvents.DOWNLOAD_COMPLETED
	data = {'ok': True}

	# Act
	service.emit_sync(event, data)

	# Assert
	mock_emit.assert_called_once_with(event, data=data)
	mock_get_event_loop.assert_called_once()
	assert 'coro' in captured_args and asyncio.iscoroutine(captured_args['coro']) is True
	assert captured_args['loop'] is test_loop
	test_loop.close()


@pytest.mark.asyncio
async def test_download_start_emits_correct_event(monkeypatch: pytest.MonkeyPatch) -> None:
	# Arrange
	service = SocketService()
	mock_emit = AsyncMock(return_value=None)
	monkeypatch.setattr(service, 'emit', mock_emit)
	payload = PayloadModel(model='m1', size=123)

	# Act
	await service.download_start(payload)

	# Assert
	mock_emit.assert_awaited_once_with(SocketEvents.DOWNLOAD_START, data=payload.model_dump())
	# Close the custom loop created by SocketService to avoid unclosed loop warnings
	try:
		if service.loop and not service.loop.is_closed():
			service.loop.close()
	except Exception:
		pass


@pytest.mark.asyncio
async def test_download_completed_emits_correct_event(monkeypatch: pytest.MonkeyPatch) -> None:
	# Arrange
	service = SocketService()
	mock_emit = AsyncMock(return_value=None)
	monkeypatch.setattr(service, 'emit', mock_emit)
	payload = PayloadModel(total=10, succeeded=10)

	# Act
	await service.download_completed(payload)

	# Assert
	mock_emit.assert_awaited_once_with(SocketEvents.DOWNLOAD_COMPLETED, data=payload.model_dump())
	# Close the custom loop created by SocketService to avoid unclosed loop warnings
	try:
		if service.loop and not service.loop.is_closed():
			service.loop.close()
	except Exception:
		pass


def test_download_step_progress_emits_sync(monkeypatch: pytest.MonkeyPatch) -> None:
	# Arrange
	test_loop = asyncio.new_event_loop()
	monkeypatch.setattr(asyncio, 'get_event_loop', lambda: test_loop)
	service = SocketService()
	mock_emit_sync = Mock()
	monkeypatch.setattr(service, 'emit_sync', mock_emit_sync)
	payload = PayloadModel(step=3, of=10)

	# Act
	service.download_step_progress(payload)

	# Assert
	mock_emit_sync.assert_called_once_with(SocketEvents.DOWNLOAD_STEP_PROGRESS, data=payload.model_dump())
	test_loop.close()


def test_model_load_started_emits_sync(monkeypatch: pytest.MonkeyPatch) -> None:
	# Arrange
	test_loop = asyncio.new_event_loop()
	monkeypatch.setattr(asyncio, 'get_event_loop', lambda: test_loop)
	service = SocketService()
	mock_emit_sync = Mock()
	monkeypatch.setattr(service, 'emit_sync', mock_emit_sync)
	payload = PayloadModel(model='test-model')

	# Act
	service.model_load_started(payload)

	# Assert
	mock_emit_sync.assert_called_once_with(SocketEvents.MODEL_LOAD_STARTED, data=payload.model_dump())
	test_loop.close()


def test_model_load_progress_emits_sync(monkeypatch: pytest.MonkeyPatch) -> None:
	# Arrange
	test_loop = asyncio.new_event_loop()
	monkeypatch.setattr(asyncio, 'get_event_loop', lambda: test_loop)
	service = SocketService()
	mock_emit_sync = Mock()
	monkeypatch.setattr(service, 'emit_sync', mock_emit_sync)
	payload = PayloadModel(model='test-model', step=5, of=9)

	# Act
	service.model_load_progress(payload)

	# Assert
	mock_emit_sync.assert_called_once_with(SocketEvents.MODEL_LOAD_PROGRESS, data=payload.model_dump())
	test_loop.close()


def test_model_load_failed_emits_sync(monkeypatch: pytest.MonkeyPatch) -> None:
	# Arrange
	test_loop = asyncio.new_event_loop()
	monkeypatch.setattr(asyncio, 'get_event_loop', lambda: test_loop)
	service = SocketService()
	mock_emit_sync = Mock()
	monkeypatch.setattr(service, 'emit_sync', mock_emit_sync)
	payload = PayloadModel(model='test-model', status='failed')

	# Act
	service.model_load_failed(payload)

	# Assert
	mock_emit_sync.assert_called_once_with(SocketEvents.MODEL_LOAD_FAILED, data=payload.model_dump())
	test_loop.close()


def test_model_load_completed_emits_sync(monkeypatch: pytest.MonkeyPatch) -> None:
	# Arrange
	test_loop = asyncio.new_event_loop()
	monkeypatch.setattr(asyncio, 'get_event_loop', lambda: test_loop)
	service = SocketService()
	mock_emit_sync = Mock()
	monkeypatch.setattr(service, 'emit_sync', mock_emit_sync)
	payload = PayloadModel(model='m1', status='ready')

	# Act
	service.model_load_completed(payload)

	# Assert
	mock_emit_sync.assert_called_once_with(SocketEvents.MODEL_LOAD_COMPLETED, data=payload.model_dump())
	test_loop.close()


def test_image_generation_step_end_emits_sync(monkeypatch: pytest.MonkeyPatch) -> None:
	# Arrange
	test_loop = asyncio.new_event_loop()
	monkeypatch.setattr(asyncio, 'get_event_loop', lambda: test_loop)
	service = SocketService()
	mock_emit_sync = Mock()
	monkeypatch.setattr(service, 'emit_sync', mock_emit_sync)
	payload = PayloadModel(step=5)

	# Act
	service.image_generation_step_end(payload)

	# Assert
	mock_emit_sync.assert_called_once_with(SocketEvents.IMAGE_GENERATION_STEP_END, data=payload.model_dump())
	test_loop.close()


def test_generation_phase_emits_sync(monkeypatch: pytest.MonkeyPatch) -> None:
	# Arrange
	test_loop = asyncio.new_event_loop()
	monkeypatch.setattr(asyncio, 'get_event_loop', lambda: test_loop)
	service = SocketService()
	mock_emit_sync = Mock()
	monkeypatch.setattr(service, 'emit_sync', mock_emit_sync)
	payload = PayloadModel(phases=['image_generation'], current='image_generation')

	# Act
	service.generation_phase(payload)

	# Assert
	mock_emit_sync.assert_called_once_with(SocketEvents.GENERATION_PHASE, data=payload.model_dump())
	test_loop.close()


def test_get_event_loop_returns_cached_loop_if_available() -> None:
	# Arrange
	service = SocketService()
	test_loop = asyncio.new_event_loop()
	service.loop = test_loop

	# Act
	result = service.get_event_loop()

	# Assert
	assert result is test_loop
	test_loop.close()


def test_get_event_loop_returns_none_if_cached_loop_is_closed() -> None:
	# Arrange
	service = SocketService()
	test_loop = asyncio.new_event_loop()
	test_loop.close()
	service.loop = test_loop

	# Act
	with (
		patch('asyncio.get_running_loop', side_effect=RuntimeError('No running loop')),
		patch('asyncio.new_event_loop', side_effect=RuntimeError('Cannot create loop')),
	):
		result = service.get_event_loop()

	# Assert
	assert result is None


def test_get_event_loop_gets_running_loop_if_available(monkeypatch: pytest.MonkeyPatch) -> None:
	# Arrange
	service = SocketService()
	test_loop = asyncio.new_event_loop()
	mock_get_running_loop = Mock(return_value=test_loop)
	monkeypatch.setattr(asyncio, 'get_running_loop', mock_get_running_loop)

	# Act
	result = service.get_event_loop()

	# Assert
	assert result is test_loop
	assert service.loop is test_loop  # Verify it's cached
	mock_get_running_loop.assert_called_once()
	test_loop.close()


def test_get_event_loop_creates_new_loop_if_no_running_loop(monkeypatch: pytest.MonkeyPatch) -> None:
	# Arrange
	service = SocketService()
	test_loop = asyncio.new_event_loop()
	monkeypatch.setattr(asyncio, 'get_running_loop', Mock(side_effect=RuntimeError('No running loop')))
	monkeypatch.setattr(asyncio, 'new_event_loop', Mock(return_value=test_loop))

	# Act
	result = service.get_event_loop()

	# Assert
	assert result is test_loop
	assert service.loop is test_loop  # Verify it's cached
	test_loop.close()


def test_emit_sync_logs_warning_when_no_loop_available(
	monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
	# Arrange
	service = SocketService()
	# Mock get_event_loop to return None (no loop available)
	monkeypatch.setattr(service, 'get_event_loop', Mock(return_value=None))
	# Mock the socketio emit to ensure it's not called
	mock_emit = AsyncMock()
	monkeypatch.setattr(service.sio, 'emit', mock_emit)
	# Mock run_coroutine_threadsafe to ensure it's not called
	mock_run_coroutine = Mock()
	monkeypatch.setattr(asyncio, 'run_coroutine_threadsafe', mock_run_coroutine)

	event = SocketEvents.DOWNLOAD_START
	data = {'test': 'data'}

	# Act
	service.emit_sync(event, data)

	# Assert
	assert f'No event loop available; dropping socket emit for {event}' in caplog.text
	mock_emit.assert_not_called()
	mock_run_coroutine.assert_not_called()
