"""Tests for macOS (Darwin) platform optimizer."""

from unittest.mock import MagicMock, patch

import pytest


@pytest.fixture
def mock_pipe():
	"""Create a mock diffusion pipeline."""
	pipe = MagicMock()
	pipe.enable_vae_slicing = MagicMock()
	pipe.enable_attention_slicing = MagicMock()
	return pipe


@pytest.fixture
def darwin_optimizer():
	"""Get DarwinOptimizer instance."""
	from app.cores.platform_optimizations.darwin import DarwinOptimizer

	return DarwinOptimizer()


class TestDarwinOptimizer:
	"""Test DarwinOptimizer class."""

	def test_get_platform_name_returns_macos(self, darwin_optimizer):
		"""Test get_platform_name returns 'macOS'."""
		assert darwin_optimizer.get_platform_name() == 'macOS'

	@patch('app.cores.platform_optimizations.darwin.device_service')
	def test_apply_with_mps(self, mock_device_service, darwin_optimizer, mock_pipe):
		"""Test apply with MPS (Apple Silicon)."""
		mock_device_service.is_mps = True

		darwin_optimizer.apply(mock_pipe)

		mock_pipe.enable_attention_slicing.assert_called_once()
		mock_pipe.enable_vae_slicing.assert_called_once()

	@patch('app.cores.platform_optimizations.darwin.device_service')
	@patch('platform.machine')
	def test_apply_with_mps_logs_chip_info(self, mock_machine, mock_device_service, darwin_optimizer, mock_pipe):
		"""Test apply with MPS logs chip information."""
		mock_device_service.is_mps = True
		mock_machine.return_value = 'arm64'

		darwin_optimizer.apply(mock_pipe)

		mock_machine.assert_called_once()
		mock_pipe.enable_attention_slicing.assert_called_once()
		mock_pipe.enable_vae_slicing.assert_called_once()

	@patch('app.cores.platform_optimizations.darwin.device_service')
	def test_apply_with_cpu(self, mock_device_service, darwin_optimizer, mock_pipe):
		"""Test apply with CPU (Intel Macs)."""
		mock_device_service.is_mps = False

		darwin_optimizer.apply(mock_pipe)

		mock_pipe.enable_attention_slicing.assert_called_once()
		mock_pipe.enable_vae_slicing.assert_called_once()

	@patch('app.cores.platform_optimizations.darwin.device_service')
	def test_apply_always_enables_slicing_regardless_of_device(self, mock_device_service, darwin_optimizer, mock_pipe):
		"""Test that slicing is always enabled regardless of device type."""
		# Test with MPS
		mock_device_service.is_mps = True
		darwin_optimizer.apply(mock_pipe)
		assert mock_pipe.enable_attention_slicing.call_count == 1
		assert mock_pipe.enable_vae_slicing.call_count == 1

		# Reset mocks
		mock_pipe.reset_mock()

		# Test with CPU
		mock_device_service.is_mps = False
		darwin_optimizer.apply(mock_pipe)
		assert mock_pipe.enable_attention_slicing.call_count == 1
		assert mock_pipe.enable_vae_slicing.call_count == 1
