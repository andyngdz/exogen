"""Tests for seed_manager module."""

from unittest.mock import Mock, patch

import pytest
import torch


@pytest.fixture
def mock_seed_manager():
	"""Create SeedManager with mocked dependencies."""
	with (
		patch('app.cores.generation.seed_manager.device_service') as mock_device_service,
		patch('app.cores.generation.seed_manager.torch') as mock_torch,
	):
		# Configure device_service
		mock_device_service.is_available = False
		mock_device_service.is_cuda = False
		mock_device_service.is_mps = False

		# Configure torch
		mock_torch.randint.return_value = torch.tensor([12345])
		mock_torch.manual_seed = Mock()
		mock_torch.cuda.manual_seed = Mock()
		mock_torch.mps.manual_seed = Mock()

		from app.cores.generation.seed_manager import SeedManager

		manager = SeedManager()

		yield manager, mock_device_service, mock_torch


class TestGetRandomSeed:
	def test_returns_valid_integer_in_range(self, mock_seed_manager):
		manager, *_ = mock_seed_manager
		seed = manager.get_random_seed
		assert isinstance(seed, int)
		assert 0 <= seed < 2**32


class TestGetSeed:
	def test_uses_explicit_seed_when_not_minus_one(self, mock_seed_manager):
		manager, _, mock_torch = mock_seed_manager
		result = manager.get_seed(42)

		assert result == 42
		mock_torch.manual_seed.assert_called_once_with(42)

	def test_generates_random_seed_when_minus_one(self, mock_seed_manager):
		manager, _, mock_torch = mock_seed_manager
		result = manager.get_seed(-1)

		assert result == manager.get_random_seed
		mock_torch.manual_seed.assert_called_once()

	def test_sets_cuda_seed_when_cuda_available(self, mock_seed_manager):
		manager, mock_device_service, mock_torch = mock_seed_manager
		mock_device_service.is_available = True
		mock_device_service.is_cuda = True

		manager.get_seed(42)

		mock_torch.cuda.manual_seed.assert_called_once_with(42)

	def test_sets_mps_seed_when_mps_available(self, mock_seed_manager):
		manager, mock_device_service, mock_torch = mock_seed_manager
		mock_device_service.is_available = True
		mock_device_service.is_mps = True

		manager.get_seed(42)

		mock_torch.mps.manual_seed.assert_called_once_with(42)
