"""Factory for creating platform-specific optimizers."""

from app.constants.platform import OperatingSystem
from app.services import logger_service

from .base import PlatformOptimizer
from .darwin import DarwinOptimizer
from .linux import LinuxOptimizer
from .windows import WindowsOptimizer

logger = logger_service.get_logger(__name__, category='PlatformOpt')


def get_optimizer() -> PlatformOptimizer:
	"""Get the appropriate optimizer for the current platform.

	Returns:
		PlatformOptimizer: Platform-specific optimizer instance

	Raises:
		RuntimeError: If platform is not supported
	"""
	try:
		os_type = OperatingSystem.from_sys_platform()
	except ValueError as error:
		logger.error(str(error))
		raise RuntimeError(str(error)) from error

	if os_type == OperatingSystem.WINDOWS:
		logger.info('Using Windows optimizer')
		return WindowsOptimizer()
	if os_type == OperatingSystem.LINUX:
		logger.info('Using Linux optimizer')
		return LinuxOptimizer()
	if os_type == OperatingSystem.DARWIN:
		logger.info('Using macOS optimizer')
		return DarwinOptimizer()

	# This should never be reached since enum only has 3 values
	error_msg = f'Unsupported platform: {os_type}'
	logger.error(error_msg)
	raise RuntimeError(error_msg)
