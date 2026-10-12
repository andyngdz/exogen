"""Tests for memory_manager module."""

from unittest.mock import patch

import pytest


@pytest.fixture
def mock_memory_manager():
	"""Create MemoryManager with mocked dependencies."""
	with (
		patch('app.cores.generation.memory_manager.device_service') as mock_device_service,
		patch('app.cores.generation.memory_manager.clear_device_cache') as mock_clear_cache,
	):
		# Configure device_service
		mock_device_service.is_cuda = False
		mock_device_service.is_mps = False
		mock_device_service.get_recommended_batch_size.return_value = 3

		from app.cores.generation.memory_manager import MemoryManager

		manager = MemoryManager()

		yield manager, mock_device_service, mock_clear_cache


class TestClearCache:
	def test_invokes_helper_when_cuda_available(self, mock_memory_manager):
		manager, mock_device_service, mock_clear_cache = mock_memory_manager
		mock_device_service.is_cuda = True

		manager.clear_cache()

		mock_clear_cache.assert_called_once_with(reason='Memory manager clearing cache')

	def test_invokes_helper_when_mps_available(self, mock_memory_manager):
		manager, mock_device_service, mock_clear_cache = mock_memory_manager
		mock_device_service.is_mps = True

		manager.clear_cache()

		mock_clear_cache.assert_called_once_with(reason='Memory manager clearing cache')

	def test_invokes_helper_even_without_accelerator(self, mock_memory_manager):
		manager, mock_device_service, mock_clear_cache = mock_memory_manager
		mock_device_service.is_cuda = False
		mock_device_service.is_mps = False

		manager.clear_cache()

		mock_clear_cache.assert_called_once_with(reason='Memory manager clearing cache')


class TestValidateBatchSize:
	def test_logs_warning_when_batch_exceeds_recommended(self, mock_memory_manager, caplog):
		manager, mock_device_service, _ = mock_memory_manager
		mock_device_service.get_recommended_batch_size.return_value = 3

		manager.validate_batch_size(number_of_images=5, width=512, height=512)

		assert 'may cause OOM errors' in caplog.text
		assert 'Recommended: 3' in caplog.text

	def test_no_warning_when_batch_within_recommended(self, mock_memory_manager, caplog):
		manager, mock_device_service, _ = mock_memory_manager
		mock_device_service.get_recommended_batch_size.return_value = 3

		manager.validate_batch_size(number_of_images=2, width=512, height=512)

		assert 'may cause OOM errors' not in caplog.text
