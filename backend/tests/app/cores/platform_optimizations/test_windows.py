"""Tests for Windows platform optimizer."""

from unittest.mock import MagicMock, patch

import pytest

from app.constants.platform import OperatingSystem


@pytest.fixture
def mock_pipe():
	"""Create a mock diffusion pipeline."""
	pipe = MagicMock()
	pipe.enable_vae_slicing = MagicMock()
	pipe.enable_attention_slicing = MagicMock()
	pipe.disable_attention_slicing = MagicMock()
	return pipe


@pytest.fixture
def windows_optimizer():
	"""Get WindowsOptimizer instance."""
	from app.cores.platform_optimizations.windows import WindowsOptimizer

	return WindowsOptimizer()


class TestWindowsOptimizer:
	"""Test WindowsOptimizer class."""

	def test_get_platform_name_returns_windows(self, windows_optimizer):
		"""Test get_platform_name returns 'Windows'."""
		assert windows_optimizer.get_platform_name() == OperatingSystem.WINDOWS.value

	@patch('app.cores.platform_optimizations.windows.device_service')
	def test_apply_with_cuda_high_memory(self, mock_device_service, windows_optimizer, mock_pipe):
		"""Test apply with CUDA and high memory (>= 8GB) - disables attention slicing."""
		mock_device_service.is_cuda = True
		mock_device_service.get_gpu_memory_gb.return_value = 12.0
		mock_device_service.get_device_name.return_value = 'NVIDIA RTX 3060'

		windows_optimizer.apply(mock_pipe)

		mock_pipe.enable_vae_slicing.assert_called_once()
		mock_pipe.disable_attention_slicing.assert_called_once()
		mock_pipe.enable_attention_slicing.assert_not_called()

	@patch('app.cores.platform_optimizations.windows.device_service')
	@patch('app.cores.platform_optimizations.windows.torch')
	def test_apply_cuda_enables_tf32(self, mock_torch, mock_device_service, windows_optimizer, mock_pipe):
		"""Test CUDA path enables TF32 for faster operations."""
		mock_device_service.is_cuda = True
		mock_device_service.get_gpu_memory_gb.return_value = 12.0
		mock_device_service.get_device_name.return_value = 'NVIDIA RTX 3060'

		windows_optimizer.apply(mock_pipe)

		assert mock_torch.backends.cuda.matmul.allow_tf32 is True
		assert mock_torch.backends.cudnn.allow_tf32 is True

	@patch('app.cores.platform_optimizations.windows.device_service')
	def test_apply_with_cuda_low_memory(self, mock_device_service, windows_optimizer, mock_pipe):
		"""Test apply with CUDA and low memory (< 8GB) - enables attention slicing."""
		mock_device_service.is_cuda = True
		mock_device_service.get_gpu_memory_gb.return_value = 6.0
		mock_device_service.get_device_name.return_value = 'NVIDIA GTX 1060'

		windows_optimizer.apply(mock_pipe)

		mock_pipe.enable_vae_slicing.assert_called_once()
		mock_pipe.enable_attention_slicing.assert_called_once_with(slice_size='auto')
		mock_pipe.disable_attention_slicing.assert_not_called()

	@patch('app.cores.platform_optimizations.windows.device_service')
	def test_apply_with_cuda_exact_threshold(self, mock_device_service, windows_optimizer, mock_pipe):
		"""Test apply with exactly 8GB - should disable attention slicing."""
		mock_device_service.is_cuda = True
		mock_device_service.get_gpu_memory_gb.return_value = 8.0
		mock_device_service.get_device_name.return_value = 'NVIDIA RTX 2060'

		windows_optimizer.apply(mock_pipe)

		mock_pipe.enable_vae_slicing.assert_called_once()
		mock_pipe.disable_attention_slicing.assert_called_once()
		mock_pipe.enable_attention_slicing.assert_not_called()

	@patch('app.cores.platform_optimizations.windows.device_service')
	def test_apply_with_cuda_no_memory_detection(self, mock_device_service, windows_optimizer, mock_pipe):
		"""Test apply when GPU memory cannot be detected - defaults to performance mode."""
		mock_device_service.is_cuda = True
		mock_device_service.get_gpu_memory_gb.return_value = None

		windows_optimizer.apply(mock_pipe)

		mock_pipe.enable_vae_slicing.assert_called_once()
		mock_pipe.disable_attention_slicing.assert_called_once()
		mock_pipe.enable_attention_slicing.assert_not_called()

	@patch('app.cores.platform_optimizations.windows.device_service')
	def test_apply_with_cpu(self, mock_device_service, windows_optimizer, mock_pipe):
		"""Test apply with CPU fallback - enables attention slicing."""
		mock_device_service.is_cuda = False

		windows_optimizer.apply(mock_pipe)

		mock_pipe.enable_vae_slicing.assert_called_once()
		mock_pipe.enable_attention_slicing.assert_called_once()
		mock_pipe.disable_attention_slicing.assert_not_called()

	@patch('app.cores.platform_optimizations.windows.device_service')
	def test_apply_cpu_optimizations_directly(self, mock_device_service, windows_optimizer, mock_pipe):
		"""Test _apply_cpu_optimizations method directly."""
		windows_optimizer._apply_cpu_optimizations(mock_pipe)

		mock_pipe.enable_attention_slicing.assert_called_once()

	@patch('app.cores.platform_optimizations.windows.device_service')
	@patch('app.cores.platform_optimizations.windows.torch')
	def test_apply_cuda_optimizations_with_memory_info(
		self, mock_torch, mock_device_service, windows_optimizer, mock_pipe
	):
		"""Test _apply_cuda_optimizations with complete memory info."""
		mock_device_service.get_gpu_memory_gb.return_value = 10.5
		mock_device_service.get_device_name.return_value = 'NVIDIA RTX 3070'

		windows_optimizer._apply_cuda_optimizations(mock_pipe)

		mock_device_service.get_gpu_memory_gb.assert_called_once_with(0)
		mock_device_service.get_device_name.assert_called_once_with(0)
		mock_pipe.disable_attention_slicing.assert_called_once()
