"""Windows-specific optimizations for CUDA pipelines."""

import torch

from app.constants.memory_thresholds import ATTENTION_SLICING_THRESHOLD_GB
from app.constants.platform import OperatingSystem
from app.services import device_service, logger_service

from .base import PlatformOptimizer

logger = logger_service.get_logger(__name__, category='PlatformOpt')


class WindowsOptimizer(PlatformOptimizer):
	"""Optimizations for Windows with CUDA support.

	Key optimizations:
	1. TF32: Enabled for faster float32 operations on Ampere+ GPUs (30xx, 40xx series)
	2. Attention slicing: Only enabled for low-memory GPUs (<8GB VRAM by default)
		- Threshold defined in ATTENTION_SLICING_THRESHOLD_GB constant
		- High-memory GPUs: Disabled for maximum speed
		- Low-memory GPUs: Enabled to prevent OOM errors
	3. VAE slicing: Always enabled (minimal performance impact, good memory savings)
	4. SDPA: Uses PyTorch's built-in Scaled Dot Product Attention (2-4x faster)
	"""

	def apply(self, pipe) -> None:
		"""Apply Windows-specific optimizations.

		Args:
			pipe: The diffusion pipeline to optimize
		"""
		# Always enable VAE slicing for memory efficiency (minimal performance impact)
		pipe.enable_vae_slicing()
		logger.info('[Windows] VAE slicing enabled')

		if device_service.is_cuda:
			self._apply_cuda_optimizations(pipe)
		else:
			# CPU fallback
			self._apply_cpu_optimizations(pipe)

	def _apply_cuda_optimizations(self, pipe) -> None:
		"""Apply CUDA-specific optimizations for Windows.

		Args:
			pipe: The diffusion pipeline to optimize
		"""
		# Enable TF32 for significant speedup on Ampere and newer GPUs (RTX 30xx, 40xx)
		# This provides ~2x speedup with minimal accuracy loss
		torch.backends.cuda.matmul.allow_tf32 = True
		torch.backends.cudnn.allow_tf32 = True
		logger.info('[Windows] TF32 enabled for faster float32 operations')

		# Check GPU memory to determine if we need memory-saving mode
		gpu_memory_gb = device_service.get_gpu_memory_gb(0)
		if gpu_memory_gb is not None:
			gpu_name = device_service.get_device_name(0)
			logger.info(f'[Windows] CUDA GPU: {gpu_name} ({gpu_memory_gb:.1f}GB VRAM)')

			# Only enable attention slicing for low-memory GPUs
			# Attention slicing trades speed for memory - it can make generation 5-10x slower!
			if gpu_memory_gb < ATTENTION_SLICING_THRESHOLD_GB:
				pipe.enable_attention_slicing(slice_size='auto')
				logger.info(f'[Windows] Attention slicing ENABLED (memory-saving mode for {gpu_memory_gb:.1f}GB VRAM)')
			else:
				# Disable attention slicing for better performance on high-memory GPUs
				pipe.disable_attention_slicing()
				logger.info(f'[Windows] Attention slicing DISABLED (performance mode for {gpu_memory_gb:.1f}GB VRAM)')
		else:
			# Fallback: assume high-memory GPU
			pipe.disable_attention_slicing()
			logger.warning('[Windows] Could not detect GPU memory, defaulting to performance mode')

		logger.info('[Windows] CUDA optimizations applied successfully')

	def _apply_cpu_optimizations(self, pipe) -> None:
		"""Apply CPU-specific optimizations for Windows.

		Args:
			pipe: The diffusion pipeline to optimize
		"""
		# Enable attention slicing for CPU to manage memory
		pipe.enable_attention_slicing()
		logger.info('[Windows] CPU mode: attention slicing + VAE slicing enabled')

	def get_platform_name(self) -> str:
		"""Get the platform name.

		Returns:
			'Windows'
		"""
		return OperatingSystem.WINDOWS.value
