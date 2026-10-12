"""Tests for Real-ESRGAN AI upscaler."""

from unittest.mock import MagicMock, patch

import numpy as np
import pytest
from PIL import Image

from app.cores.upscalers.realesrgan.upscaler import RealESRGANUpscaler
from app.schemas.hires_fix import UpscalerType


class TestRealESRGANUpscaler:
	"""Test Real-ESRGAN upscaling functionality."""

	@pytest.fixture
	def upscaler(self):
		"""Create upscaler instance."""
		return RealESRGANUpscaler()

	@pytest.fixture
	def sample_images(self):
		"""Create sample PIL images [512x512]."""
		return [Image.new('RGB', (512, 512), color='red')]

	@pytest.fixture
	def mock_model(self):
		"""Create mock RealESRGANer that returns upscaled numpy array."""
		mock = MagicMock()
		upscaled_array = np.zeros((1024, 1024, 3), dtype=np.uint8)
		mock.enhance.return_value = (upscaled_array, None)
		mock.scale = 2
		return mock

	def test_upscale_empty_list(self, upscaler):
		"""Test that empty image list returns empty list."""
		result = upscaler.upscale([], UpscalerType.REALESRGAN_X2PLUS, 2.0)
		assert result == []

	def test_upscale_x2plus_model(self, upscaler, sample_images, mock_model):
		"""Test upscaling with x2plus model."""
		with (
			patch('app.cores.upscalers.realesrgan.upscaler.realesrgan_model_manager') as mock_model_manager,
			patch('app.cores.upscalers.realesrgan.upscaler.realesrgan_resource_manager'),
		):
			mock_model_manager.load.return_value = mock_model

			result = upscaler.upscale(sample_images, UpscalerType.REALESRGAN_X2PLUS, 2.0)

			assert len(result) == 1
			assert isinstance(result[0], Image.Image)

	def test_upscale_x4plus_model(self, upscaler, sample_images):
		"""Test upscaling with x4plus model."""
		mock_model = MagicMock()
		upscaled_array = np.zeros((2048, 2048, 3), dtype=np.uint8)
		mock_model.enhance.return_value = (upscaled_array, None)
		mock_model.scale = 4

		with (
			patch('app.cores.upscalers.realesrgan.upscaler.realesrgan_model_manager') as mock_model_manager,
			patch('app.cores.upscalers.realesrgan.upscaler.realesrgan_resource_manager'),
		):
			mock_model_manager.load.return_value = mock_model

			result = upscaler.upscale(sample_images, UpscalerType.REALESRGAN_X4PLUS, 4.0)

			assert len(result) == 1
			assert isinstance(result[0], Image.Image)

	def test_cleanup_called_after_upscale(self, upscaler, sample_images, mock_model):
		"""Test that cleanup is called after upscaling."""
		with (
			patch('app.cores.upscalers.realesrgan.upscaler.realesrgan_model_manager') as mock_model_manager,
			patch('app.cores.upscalers.realesrgan.upscaler.realesrgan_resource_manager') as mock_resource_manager,
		):
			mock_model_manager.load.return_value = mock_model

			upscaler.upscale(sample_images, UpscalerType.REALESRGAN_X2PLUS, 2.0)

			mock_resource_manager.cleanup.assert_called_once()
			assert upscaler._model is None

	def test_cleanup_called_on_error(self, upscaler, sample_images):
		"""Test that cleanup is called even when upscaling fails."""
		mock_model = MagicMock()
		mock_model.enhance.side_effect = RuntimeError('Upscaling failed')
		mock_model.scale = 2

		with (
			patch('app.cores.upscalers.realesrgan.upscaler.realesrgan_model_manager') as mock_model_manager,
			patch('app.cores.upscalers.realesrgan.upscaler.realesrgan_resource_manager') as mock_resource_manager,
		):
			mock_model_manager.load.return_value = mock_model

			with pytest.raises(RuntimeError):
				upscaler.upscale(sample_images, UpscalerType.REALESRGAN_X2PLUS, 2.0)

			mock_resource_manager.cleanup.assert_called_once()
			assert upscaler._model is None

	def test_target_scale_resize(self, upscaler, sample_images):
		"""Test that images are resized when target scale differs from native."""
		mock_model = MagicMock()
		upscaled_array = np.zeros((2048, 2048, 3), dtype=np.uint8)
		mock_model.enhance.return_value = (upscaled_array, None)
		mock_model.scale = 4

		with (
			patch('app.cores.upscalers.realesrgan.upscaler.realesrgan_model_manager') as mock_model_manager,
			patch('app.cores.upscalers.realesrgan.upscaler.realesrgan_resource_manager'),
		):
			mock_model_manager.load.return_value = mock_model

			result = upscaler.upscale(sample_images, UpscalerType.REALESRGAN_X4PLUS, 3.0)

			assert len(result) == 1
			assert result[0].size == (1536, 1536)

	def test_upscale_images_raises_when_model_not_loaded(self, upscaler, sample_images):
		"""Test that _upscale_images raises when model is None."""
		with pytest.raises(RuntimeError, match='Model not loaded'):
			upscaler._upscale_images(sample_images)
