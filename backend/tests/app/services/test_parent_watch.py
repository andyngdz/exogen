"""Tests for the parent process watch."""

import asyncio
import signal
import subprocess
import sys
from collections.abc import Iterator
from unittest.mock import MagicMock, patch

import pytest

from app.services.parent_watch import ParentWatchService


@pytest.fixture
def parent_process() -> Iterator[subprocess.Popen[bytes]]:
	"""A real process standing in for the app."""
	process = subprocess.Popen([sys.executable, '-c', 'import time; time.sleep(60)'])
	yield process
	process.kill()
	process.wait()


@pytest.fixture
def raise_signal() -> Iterator[MagicMock]:
	with patch('app.services.parent_watch.signal.raise_signal') as mock_raise_signal:
		yield mock_raise_signal


class TestParseParentPid:
	@pytest.mark.parametrize('raw', [None, '', 'abc', '-5', '0', '12.5'])
	def test_rejects_missing_or_invalid_values(self, raw: str | None):
		assert ParentWatchService().parse_parent_pid(raw) is None

	def test_reads_a_positive_pid(self):
		assert ParentWatchService().parse_parent_pid('4242') == 4242


class TestWatch:
	async def test_shuts_down_after_the_parent_exits(
		self, parent_process: subprocess.Popen[bytes], raise_signal: MagicMock
	):
		task = ParentWatchService(interval_seconds=0.05).start(parent_process.pid)
		assert task is not None

		await asyncio.sleep(0.2)
		raise_signal.assert_not_called()

		parent_process.kill()
		parent_process.wait()
		await asyncio.wait_for(task, timeout=2)

		raise_signal.assert_called_once_with(signal.SIGTERM)

	async def test_shuts_down_when_the_parent_is_already_gone(
		self, parent_process: subprocess.Popen[bytes], raise_signal: MagicMock
	):
		parent_process.kill()
		parent_process.wait()

		task = ParentWatchService().start(parent_process.pid)

		assert task is None
		raise_signal.assert_called_once_with(signal.SIGTERM)

	async def test_keeps_running_while_the_parent_lives(
		self, parent_process: subprocess.Popen[bytes], raise_signal: MagicMock
	):
		task = ParentWatchService(interval_seconds=0.05).start(parent_process.pid)
		assert task is not None

		await asyncio.sleep(0.3)
		task.cancel()

		raise_signal.assert_not_called()
