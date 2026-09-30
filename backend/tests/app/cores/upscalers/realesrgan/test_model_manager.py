"""Tests for Real-ESRGAN model manager."""

from unittest.mock import MagicMock, patch

import pytest

from app.cores.upscalers.realesrgan.model_manager import RealESRGANModelManager
from app.schemas.hires_fix import UpscalerType


class TestRealESRGANModelManager:
	"""Test Real-ESRGAN model management."""

	@pytest.fixture
	def model_manager(self):
		"""Create model manager instance."""
		return RealESRGANModelManager()

	@pytest.fixture
	def cached_model_path(self, tmp_path):
		"""Create a cached model file."""
		model_path = tmp_path / 'RealESRGAN_x2plus.pth'
		model_path.touch()
		return model_path

	def test_get_or_download_returns_cached_path(self, model_manager, cached_model_path):
		"""Test that cached model path is returned without download."""
		mock_storage = MagicMock()
		mock_storage.get_realesrgan_model_path.return_value = str(cached_model_path)

		with patch('app.cores.upscalers.realesrgan.model_manager.storage_service', mock_storage):
			result = model_manager.get_or_download(UpscalerType.REALESRGAN_X2PLUS)

			assert result == str(cached_model_path)

	def test_get_or_download_triggers_download(self, model_manager, tmp_path):
		"""Test that model is downloaded when not cached."""
		non_existent_path = tmp_path / 'RealESRGAN_x2plus.pth'

		mock_downloader = MagicMock()
		mock_pypdl_class = MagicMock(return_value=mock_downloader)

		mock_storage = MagicMock()
		mock_storage.get_realesrgan_model_path.return_value = str(non_existent_path)

		with (
			patch('app.cores.upscalers.realesrgan.model_manager.storage_service', mock_storage),
			patch('app.cores.upscalers.realesrgan.model_manager.Pypdl', mock_pypdl_class),
		):
			model_manager.get_or_download(UpscalerType.REALESRGAN_X2PLUS)

			mock_downloader.start.assert_called_once()

	def test_load_returns_realesrganer(self, model_manager, cached_model_path):
		"""Test that load returns a RealESRGANer instance."""
		mock_storage = MagicMock()
		mock_storage.get_realesrgan_model_path.return_value = str(cached_model_path)

		mock_realesrganer = MagicMock()
		mock_realesrganer_class = MagicMock(return_value=mock_realesrganer)

		with (
			patch('app.cores.upscalers.realesrgan.model_manager.storage_service', mock_storage),
			patch('app.cores.upscalers.realesrgan.model_manager.RRDBNet', MagicMock()),
			patch('app.cores.upscalers.realesrgan.model_manager.RealESRGANer', mock_realesrganer_class),
		):
			result = model_manager.load(UpscalerType.REALESRGAN_X2PLUS)

			assert result == mock_realesrganer
			mock_realesrganer_class.assert_called_once()

	def test_create_network_anime_model(self, model_manager):
		"""Test that anime model uses correct network architecture."""
		mock_rrdbnet = MagicMock()

		with patch('app.cores.upscalers.realesrgan.model_manager.RRDBNet', mock_rrdbnet):
			model_manager._create_network(UpscalerType.REALESRGAN_X4PLUS_ANIME, scale=4)

			mock_rrdbnet.assert_called_once_with(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=6, num_grow_ch=32, scale=4)

	def test_create_network_standard_model(self, model_manager):
		"""Test that standard model uses correct network architecture."""
		mock_rrdbnet = MagicMock()

		with patch('app.cores.upscalers.realesrgan.model_manager.RRDBNet', mock_rrdbnet):
			model_manager._create_network(UpscalerType.REALESRGAN_X4PLUS, scale=4)

			mock_rrdbnet.assert_called_once_with(
				num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4
			)
