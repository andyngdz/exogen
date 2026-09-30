"""Tests for platform optimizer factory."""

from unittest.mock import patch

import pytest

from app.constants.platform import OperatingSystem


class TestGetOptimizer:
	"""Test get_optimizer factory function."""

	@patch('app.cores.platform_optimizations.factory.OperatingSystem.from_sys_platform')
	def test_returns_windows_optimizer_on_win32(self, mock_from_sys_platform):
		"""Test returns WindowsOptimizer on Windows."""
		from app.cores.platform_optimizations.factory import get_optimizer
		from app.cores.platform_optimizations.windows import WindowsOptimizer

		mock_from_sys_platform.return_value = OperatingSystem.WINDOWS

		optimizer = get_optimizer()

		assert isinstance(optimizer, WindowsOptimizer)
		assert optimizer.get_platform_name() == OperatingSystem.WINDOWS.value

	@patch('app.cores.platform_optimizations.factory.OperatingSystem.from_sys_platform')
	def test_returns_linux_optimizer_on_linux(self, mock_from_sys_platform):
		"""Test returns LinuxOptimizer on Linux."""
		from app.cores.platform_optimizations.factory import get_optimizer
		from app.cores.platform_optimizations.linux import LinuxOptimizer

		mock_from_sys_platform.return_value = OperatingSystem.LINUX

		optimizer = get_optimizer()

		assert isinstance(optimizer, LinuxOptimizer)
		assert optimizer.get_platform_name() == OperatingSystem.LINUX.value

	@patch('app.cores.platform_optimizations.factory.OperatingSystem.from_sys_platform')
	def test_returns_darwin_optimizer_on_macos(self, mock_from_sys_platform):
		"""Test returns DarwinOptimizer on macOS."""
		from app.cores.platform_optimizations.darwin import DarwinOptimizer
		from app.cores.platform_optimizations.factory import get_optimizer

		mock_from_sys_platform.return_value = OperatingSystem.DARWIN

		optimizer = get_optimizer()

		assert isinstance(optimizer, DarwinOptimizer)
		assert optimizer.get_platform_name() == OperatingSystem.DARWIN.display_name

	@patch('app.cores.platform_optimizations.factory.OperatingSystem.from_sys_platform')
	def test_raises_runtime_error_on_unsupported_platform(self, mock_from_sys_platform):
		"""Test raises RuntimeError for unsupported platforms."""
		from app.cores.platform_optimizations.factory import get_optimizer

		mock_from_sys_platform.side_effect = ValueError('Unsupported platform: freebsd')

		with pytest.raises(RuntimeError, match='Unsupported platform: freebsd'):
			get_optimizer()

	@patch('app.cores.platform_optimizations.factory.OperatingSystem.from_sys_platform')
	def test_raises_runtime_error_on_unknown_platform(self, mock_from_sys_platform):
		"""Test raises RuntimeError for completely unknown platforms."""
		from app.cores.platform_optimizations.factory import get_optimizer

		mock_from_sys_platform.side_effect = ValueError('Unsupported platform: unknown_os')

		with pytest.raises(RuntimeError, match='Unsupported platform: unknown_os'):
			get_optimizer()
