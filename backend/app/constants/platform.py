"""Operating system constants and utilities."""

import platform as platform_module
import sys
from enum import StrEnum


class OperatingSystem(StrEnum):
	"""Operating system identifiers returned by platform.system()."""

	WINDOWS = 'Windows'
	LINUX = 'Linux'
	DARWIN = 'Darwin'

	@classmethod
	def from_platform_system(cls) -> 'OperatingSystem':
		"""Get OS from platform.system().

		Returns:
			OperatingSystem enum value

		Raises:
			ValueError: If platform is not supported
		"""
		return cls(platform_module.system())

	@classmethod
	def from_sys_platform(cls) -> 'OperatingSystem':
		"""Get OS from sys.platform.

		Returns:
			OperatingSystem enum value

		Raises:
			ValueError: If platform is not supported
		"""
		mapping = {
			'win32': cls.WINDOWS,
			'linux': cls.LINUX,
			'darwin': cls.DARWIN,
		}
		platform_value = mapping.get(sys.platform)
		if platform_value is None:
			raise ValueError(f'Unsupported platform: {sys.platform}')
		return platform_value

	@property
	def display_name(self) -> str:
		"""Human-readable name for logging.

		Returns:
			'macOS' for Darwin, otherwise the enum value
		"""
		if self == OperatingSystem.DARWIN:
			return 'macOS'
		return self.value
