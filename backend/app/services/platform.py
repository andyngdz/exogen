import io
import sys

from app.constants.platform import OperatingSystem
from app.services.logger import logger_service
from app.services.patch_service import WindowsProactorEventLoopPolicy, setup_windows_event_loop

logger = logger_service.get_logger(__name__, category='Service')


class PlatformService:
	"""Service to handle platform-specific operations."""

	def init(self):
		"""Initialize the platform service."""
		try:
			os_type = OperatingSystem.from_sys_platform()
		except ValueError:
			return

		if os_type == OperatingSystem.WINDOWS:
			self._configure_utf8_console()

			if WindowsProactorEventLoopPolicy is not None:
				try:
					setup_windows_event_loop()
					logger.info('Windows event loop policy set for compatibility.')
				except Exception as error:
					logger.warning(f'Failed to set event loop policy: {error}')

	def _configure_utf8_console(self):
		"""Configure stdout and stderr to use UTF-8 encoding on Windows.

		This prevents UnicodeEncodeError when third-party libraries (e.g., pypdl)
		print Unicode characters that the default cp1252 encoding cannot display.
		"""
		try:
			sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', line_buffering=True)
			sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', line_buffering=True)
			logger.info('Console encoding configured for UTF-8.')
		except Exception as error:
			logger.warning(f'Failed to configure UTF-8 console encoding: {error}')


platform_service = PlatformService()
