"""macOS-specific optimizations for MPS (Apple Silicon) pipelines."""

from app.constants.platform import OperatingSystem
from app.services import device_service, logger_service

from .base import PlatformOptimizer

logger = logger_service.get_logger(__name__, category='PlatformOpt')


class DarwinOptimizer(PlatformOptimizer):
	"""Optimizations for macOS with MPS (Metal Performance Shaders) support.

	Apple Silicon GPUs share unified memory with the CPU, requiring conservative
	memory management to prevent system slowdowns.

	Key optimizations:
	1. Attention slicing: Always enabled due to unified memory architecture
	2. VAE slicing: Always enabled for memory efficiency
	3. Float32: MPS uses float32 instead of float16 to avoid NaN issues
	"""

	def apply(self, pipe) -> None:
		"""Apply macOS-specific optimizations.

		Args:
			pipe: The diffusion pipeline to optimize
		"""
		# Enable attention slicing and VAE slicing for MPS
		# MPS shares memory between CPU and GPU, so be conservative
		pipe.enable_attention_slicing()
		pipe.enable_vae_slicing()

		if device_service.is_mps:
			import platform

			chip = platform.machine()  # e.g., 'arm64'
			logger.info(f'[macOS] MPS optimizations applied for Apple Silicon ({chip})')
			logger.info('[macOS] Attention slicing + VAE slicing enabled (unified memory architecture)')
		else:
			# CPU fallback (Intel Macs)
			logger.info('[macOS] CPU optimizations: attention slicing + VAE slicing enabled')

	def get_platform_name(self) -> str:
		"""Get the platform name.

		Returns:
			'macOS'
		"""
		return OperatingSystem.DARWIN.display_name
