"""Tests for Real-ESRGAN resource manager."""

from unittest.mock import MagicMock, patch

import pytest

from app.cores.upscalers.realesrgan.resource_manager import RealESRGANResourceManager


class TestRealESRGANResourceManager:
	"""Test Real-ESRGAN resource management."""

	@pytest.fixture
	def resource_manager(self):
		"""Create resource manager instance."""
		return RealESRGANResourceManager()

	def test_cleanup_calls_resource_manager(self, resource_manager):
		"""Test that cleanup delegates to core resource manager."""
		mock_model = MagicMock()

		with patch('app.cores.upscalers.realesrgan.resource_manager.resource_manager') as mock_rm:
			resource_manager.cleanup(mock_model)

			mock_rm.cleanup_pipeline.assert_called_once_with(mock_model, 'Real-ESRGAN')

	def test_cleanup_handles_none_model(self, resource_manager):
		"""Test that cleanup handles None model gracefully."""
		with patch('app.cores.upscalers.realesrgan.resource_manager.resource_manager') as mock_rm:
			resource_manager.cleanup(None)

			mock_rm.cleanup_pipeline.assert_called_once_with(None, 'Real-ESRGAN')
