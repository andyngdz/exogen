"""Tests for the platform service."""

import io
import sys
from unittest.mock import MagicMock, patch

from app.services.platform import PlatformService, platform_service


class TestPlatformService:
	"""Test the PlatformService class."""

	def test_platform_service_singleton(self):
		"""Test that platform_service is a singleton instance."""
		assert isinstance(platform_service, PlatformService)

	def test_init_runs_successfully(self):
		"""Test that init() runs without errors on non-Windows platforms."""
		service = PlatformService()

		# Mock as Linux to avoid modifying stdout/stderr during tests
		with patch('app.services.platform.OperatingSystem.from_sys_platform') as mock_platform:
			from app.constants.platform import OperatingSystem

			mock_platform.return_value = OperatingSystem.LINUX

			# Should not raise any exceptions
			service.init()

	def test_module_imports_successfully(self):
		"""Test that the platform module imports successfully."""
		# This test ensures the module-level logger initialization is executed
		from app.services import platform

		assert platform is not None
		assert hasattr(platform, 'platform_service')


class TestConfigureUtf8Console:
	"""Test the UTF-8 console configuration functionality."""

	def test_configure_utf8_console_wraps_stdout_and_stderr(self):
		"""Test that _configure_utf8_console wraps stdout and stderr with UTF-8 encoding."""
		service = PlatformService()

		# Create mock buffers
		mock_stdout_buffer = io.BytesIO()
		mock_stderr_buffer = io.BytesIO()

		mock_stdout = MagicMock()
		mock_stdout.buffer = mock_stdout_buffer

		mock_stderr = MagicMock()
		mock_stderr.buffer = mock_stderr_buffer

		# Save originals
		original_stdout = sys.stdout
		original_stderr = sys.stderr

		try:
			sys.stdout = mock_stdout
			sys.stderr = mock_stderr

			service._configure_utf8_console()

			# Verify stdout and stderr were replaced with TextIOWrapper
			assert isinstance(sys.stdout, io.TextIOWrapper)
			assert isinstance(sys.stderr, io.TextIOWrapper)
			assert sys.stdout.encoding == 'utf-8'
			assert sys.stderr.encoding == 'utf-8'
		finally:
			# Close the TextIOWrapper instances to prevent resource leaks
			if isinstance(sys.stdout, io.TextIOWrapper) and sys.stdout is not original_stdout:
				sys.stdout.close()
			if isinstance(sys.stderr, io.TextIOWrapper) and sys.stderr is not original_stderr:
				sys.stderr.close()

			# Restore originals to avoid breaking pytest
			sys.stdout = original_stdout
			sys.stderr = original_stderr

	def test_configure_utf8_console_handles_exception_gracefully(self):
		"""Test that _configure_utf8_console logs warning on failure."""
		service = PlatformService()

		# Create a mock stdout without a buffer attribute to trigger an exception
		mock_stdout = MagicMock(spec=[])

		# Save original
		original_stdout = sys.stdout

		try:
			sys.stdout = mock_stdout
			# Should not raise, just log a warning
			service._configure_utf8_console()
		finally:
			# Restore original to avoid breaking pytest
			sys.stdout = original_stdout

	def test_init_calls_configure_utf8_console_on_windows(self):
		"""Test that init() calls _configure_utf8_console when on Windows."""
		service = PlatformService()

		with (
			patch('app.services.platform.OperatingSystem.from_sys_platform') as mock_platform,
			patch.object(service, '_configure_utf8_console') as mock_configure,
			patch('app.services.platform.WindowsProactorEventLoopPolicy', None),
		):
			from app.constants.platform import OperatingSystem

			mock_platform.return_value = OperatingSystem.WINDOWS

			service.init()

			mock_configure.assert_called_once()

	def test_init_does_not_call_configure_utf8_console_on_non_windows(self):
		"""Test that init() does not call _configure_utf8_console on non-Windows platforms."""
		service = PlatformService()

		with (
			patch('app.services.platform.OperatingSystem.from_sys_platform') as mock_platform,
			patch.object(service, '_configure_utf8_console') as mock_configure,
		):
			from app.constants.platform import OperatingSystem

			mock_platform.return_value = OperatingSystem.LINUX

			service.init()

			mock_configure.assert_not_called()
