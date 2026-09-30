"""Base class for platform-specific optimizations."""

from abc import ABC, abstractmethod
from typing import Any


class PlatformOptimizer(ABC):
	"""Abstract base class for platform-specific pipeline optimizations.

	Each platform (Windows, Linux, macOS) implements this interface to provide
	optimized configurations for image generation pipelines.
	"""

	@abstractmethod
	def apply(self, pipe: Any) -> None:
		"""Apply platform-specific optimizations to the pipeline.

		Args:
			pipe: The diffusion pipeline to optimize
		"""
		pass

	@abstractmethod
	def get_platform_name(self) -> str:
		"""Get the platform name for logging.

		Returns:
			Platform name (e.g., 'Windows', 'Linux', 'macOS')
		"""
		pass
