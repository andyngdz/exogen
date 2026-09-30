"""Schemas for GPU/driver detection and status reporting."""

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class GPUDriverStatusStates(str, Enum):
	"""Overall status of GPU/driver setup for AI acceleration."""

	READY = 'ready'
	NO_GPU = 'no_gpu'
	DRIVER_ISSUE = 'driver_issue'
	INCOMPATIBLE_CUDA = 'incompatible_cuda'
	UNKNOWN_ERROR = 'unknown_error'


class GPUDeviceInfo(BaseModel):
	"""Information about a single detected GPU device."""

	name: str = Field(
		...,
		description="Name of the GPU (e.g., 'NVIDIA GeForce RTX 3080', 'Apple M1 Max').",
	)
	memory: Optional[int] = Field(default=0, description='Total memory of the GPU.')
	cuda_compute_capability: Optional[str] = Field(
		default='0', description="CUDA compute capability (e.g., '8.6') if NVIDIA GPU."
	)
	is_primary: bool = Field(default=False, description='True if this is the primary/default GPU.')


class GPUDriverInfo(BaseModel):
	"""Comprehensive information about the system's GPU and driver setup."""

	is_cuda: bool = Field(default=False, description='True if CUDA is available and NVIDIA GPU is detected.')
	overall_status: GPUDriverStatusStates = Field(..., description='Overall status of GPU/driver setup.')
	message: str = Field(..., description='A user-friendly message explaining the status.')
	gpus: List[GPUDeviceInfo] = Field(default_factory=list, description='List of detected GPU devices.')
	nvidia_driver_version: Optional[str] = Field(
		default='0', description='NVIDIA driver version (if NVIDIA GPU detected).'
	)
	cuda_runtime_version: Optional[str] = Field(
		default='0',
		description='CUDA runtime version detected by PyTorch/system (if NVIDIA GPU).',
	)
	macos_mps_available: Optional[bool] = Field(
		default=False,
		description='True if Metal Performance Shaders (MPS) are available on macOS.',
	)
	recommendation_link: Optional[str] = Field(
		default='',
		description='A URL for recommended driver downloads or troubleshooting.',
	)
	troubleshooting_steps: Optional[List[str]] = Field(
		default_factory=lambda: [], description='Specific steps to resolve issues.'
	)


class CleanupMetrics(BaseModel):
	"""Metrics from GPU model cleanup operation."""

	time_ms: float = Field(..., description='Cleanup time in milliseconds')
	objects_collected: int = Field(..., description='Number of objects collected by GC')
	error: Optional[str] = Field(default=None, description='Error message if cleanup failed')
