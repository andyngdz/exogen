"""Tests for Linux platform optimizer."""

from unittest.mock import MagicMock, patch

import pytest

from app.constants.platform import OperatingSystem


@pytest.fixture
def mock_pipe():
	"""Create a mock diffusion pipeline."""
	pipe = MagicMock()
	pipe.enable_vae_slicing = MagicMock()
	pipe.enable_attention_slicing = MagicMock()
	return pipe


@pytest.fixture
def linux_optimizer():
	"""Get LinuxOptimizer instance."""
	from app.cores.platform_optimizations.linux import LinuxOptimizer

	return LinuxOptimizer()


class TestLinuxOptimizer:
	"""Test LinuxOptimizer class."""

	def test_get_platform_name_returns_linux(self, linux_optimizer):
		"""Test get_platform_name returns 'Linux'."""
		assert linux_optimizer.get_platform_name() == OperatingSystem.LINUX.value

	@patch('app.cores.platform_optimizations.linux.device_service')
	def test_apply_with_cuda(self, mock_device_service, linux_optimizer, mock_pipe):
		"""Test apply with CUDA."""
		mock_device_service.is_cuda = True

		linux_optimizer.apply(mock_pipe)

		mock_pipe.enable_attention_slicing.assert_called_once()
		mock_pipe.enable_vae_slicing.assert_called_once()

	@patch('app.cores.platform_optimizations.linux.device_service')
	def test_apply_with_cpu(self, mock_device_service, linux_optimizer, mock_pipe):
		"""Test apply with CPU."""
		mock_device_service.is_cuda = False

		linux_optimizer.apply(mock_pipe)

		mock_pipe.enable_attention_slicing.assert_called_once()
		mock_pipe.enable_vae_slicing.assert_called_once()

	@patch('app.cores.platform_optimizations.linux.device_service')
	def test_apply_always_enables_slicing_regardless_of_device(self, mock_device_service, linux_optimizer, mock_pipe):
		"""Test that slicing is always enabled regardless of device type."""
		# Test with CUDA
		mock_device_service.is_cuda = True
		linux_optimizer.apply(mock_pipe)
		assert mock_pipe.enable_attention_slicing.call_count == 1
		assert mock_pipe.enable_vae_slicing.call_count == 1

		# Reset mocks
		mock_pipe.reset_mock()

		# Test with CPU
		mock_device_service.is_cuda = False
		linux_optimizer.apply(mock_pipe)
		assert mock_pipe.enable_attention_slicing.call_count == 1
		assert mock_pipe.enable_vae_slicing.call_count == 1
