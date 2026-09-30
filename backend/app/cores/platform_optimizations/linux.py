"""Linux-specific optimizations for CUDA pipelines."""

from app.constants.platform import OperatingSystem
from app.services import device_service, logger_service

from .base import PlatformOptimizer

logger = logger_service.get_logger(__name__, category='PlatformOpt')


class LinuxOptimizer(PlatformOptimizer):
	"""Optimizations for Linux with CUDA support.

	This uses the proven working configuration from the original implementation.
	Conservative approach: keep what works, optimize later if needed.

	Key optimizations:
	1. Attention slicing: Always enabled for memory efficiency
	2. VAE slicing: Always enabled for memory efficiency
	"""

	def apply(self, pipe) -> None:
		"""Apply Linux-specific optimizations.

		This maintains the original working configuration for Linux systems.

		Args:
			pipe: The diffusion pipeline to optimize
		"""
		# Enable attention slicing and VAE slicing (original working configuration)
		pipe.enable_attention_slicing()
		pipe.enable_vae_slicing()

		if device_service.is_cuda:
			logger.info('[Linux] CUDA optimizations: attention slicing + VAE slicing enabled')
		else:
			logger.info('[Linux] CPU optimizations: attention slicing + VAE slicing enabled')

	def get_platform_name(self) -> str:
		"""Get the platform name.

		Returns:
			'Linux'
		"""
		return OperatingSystem.LINUX.value
