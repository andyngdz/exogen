"""GPU Information Messages and Helper Data

This module contains all GPU-related messages, links, and troubleshooting steps
used in the hardware detection API. Messages are organized by platform and scenario.
"""


class GPUInfo:
	"""Centralized GPU detection messages and information."""

	# ============================================================================
	# NVIDIA Messages
	# ============================================================================

	@staticmethod
	def nvidia_ready() -> str:
		"""Message shown when NVIDIA GPU is detected and CUDA is available."""
		return 'NVIDIA GPU detected and ready for acceleration.'

	@staticmethod
	def nvidia_no_gpu() -> str:
		"""Message shown when no NVIDIA GPU is detected on Windows/Linux."""
		return 'No NVIDIA GPU detected or CUDA is not available. Running on CPU.'

	@staticmethod
	def nvidia_driver_issue() -> str:
		"""Message shown when NVIDIA GPU exists but CUDA is unavailable."""
		return 'NVIDIA GPU detected, but CUDA is not available or drivers are incompatible. Please update your drivers.'

	@staticmethod
	def nvidia_smi_warning() -> str:
		"""Warning appended when nvidia-smi cannot retrieve driver version."""
		return " (Could not retrieve NVIDIA driver version from nvidia-smi. Ensure it's in PATH)."

	@staticmethod
	def nvidia_recommendation_link() -> str:
		"""Link to NVIDIA drivers download page."""
		return 'https://www.nvidia.com/drivers'

	@staticmethod
	def nvidia_troubleshooting_steps() -> list[str]:
		"""Troubleshooting steps for NVIDIA GPU setup."""
		return [
			'Ensure you have an NVIDIA GPU.',
			'Download and install the latest NVIDIA drivers for your system.',
			'Verify PyTorch is installed with CUDA support (e.g., pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118).',
		]

	@staticmethod
	def nvidia_driver_status_step() -> str:
		"""Additional troubleshooting step for driver status check."""
		return 'Check NVIDIA Control Panel/Settings for driver status.'

	# ============================================================================
	# macOS Messages
	# ============================================================================

	@staticmethod
	def macos_mps_ready() -> str:
		"""Message shown when Apple Silicon MPS is detected and available."""
		return 'Running on Apple Silicon. Performance may be slower than NVIDIA GPUs.'

	@staticmethod
	def macos_no_acceleration() -> str:
		"""Message shown when no GPU acceleration is available on macOS."""
		return 'No GPU acceleration available. Running on CPU.'

	@staticmethod
	def macos_troubleshooting_steps() -> list[str]:
		"""Troubleshooting steps for macOS MPS setup."""
		return [
			'Ensure you are running on an Apple Silicon Mac (M1, M2, etc.).',
			'Update macOS to the latest version.',
			'Verify PyTorch is installed with MPS support (e.g., '
			'pip install torch torchvision torchaudio --index-url '
			'https://download.pytorch.org/whl/cpu for CPU or specific MPS build).',
		]

	# ============================================================================
	# General/Error Messages
	# ============================================================================

	@staticmethod
	def default_detecting() -> str:
		"""Initial message while attempting GPU detection."""
		return 'Attempting to detect GPU and driver status...'

	@staticmethod
	def unsupported_os(os_name: str) -> str:
		"""Message shown for unsupported operating systems."""
		return f"Unsupported operating system '{os_name}' or no compatible GPU detected. Running on CPU."

	@staticmethod
	def pytorch_not_installed() -> str:
		"""Message shown when PyTorch is not accessible."""
		return 'PyTorch is not installed or not accessible in the backend environment. Cannot detect GPU.'

	@staticmethod
	def pytorch_troubleshooting() -> list[str]:
		"""Troubleshooting steps for PyTorch installation issues."""
		return ["Ensure PyTorch is correctly installed in the backend's Python environment."]

	@staticmethod
	def unexpected_error(error: str) -> str:
		"""Message shown when an unexpected error occurs during detection."""
		return f'An unexpected error occurred during GPU detection: {error}. Running on CPU.'

	@staticmethod
	def error_troubleshooting_steps() -> list[str]:
		"""General troubleshooting steps for unexpected errors."""
		return [
			'Check backend logs for more details.',
			'Ensure all dependencies are correctly installed.',
		]

	# ============================================================================
	# API Response Messages
	# ============================================================================

	@staticmethod
	def device_set_success() -> str:
		"""Success message for device selection."""
		return 'Device index set successfully.'

	@staticmethod
	def memory_config_success() -> str:
		"""Success message for memory configuration."""
		return 'Maximum memory scale factor configuration successfully saved.'
