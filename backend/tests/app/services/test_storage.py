"""Tests for the storage service."""

import os
from unittest.mock import patch

import pytest

from app.services.storage import StorageService, resolve_within, storage_service


class TestStorageService:
	"""Test the StorageService class."""

	def test_storage_service_singleton(self):
		"""Test that storage_service is a singleton instance."""
		assert isinstance(storage_service, StorageService)

	def test_init_creates_directories(self, tmp_path):
		"""Test that init() creates necessary directories."""
		service = StorageService()

		# Mock the GENERATED_IMAGES_FOLDER to use tmp_path
		with patch('app.services.storage.GENERATED_IMAGES_FOLDER', str(tmp_path / 'generated')):
			service.init()

			# Directory should be created
			assert (tmp_path / 'generated').exists()

	def test_get_model_dir(self):
		"""Test get_model_dir returns correct path."""
		service = StorageService()

		model_id = 'CompVis/stable-diffusion-v1-4'
		result = service.get_model_dir(model_id)

		# Should replace / with --
		assert 'models--CompVis--stable-diffusion-v1-4' in result
		assert result.startswith(os.path.normpath(service.cache_dir) + os.sep)

	def test_get_model_dir_handles_slashes(self):
		"""Test that get_model_dir correctly handles slashes in model IDs."""
		service = StorageService()

		model_id = 'runwayml/stable-diffusion-v1-5'
		result = service.get_model_dir(model_id)

		# Should replace all / with --
		assert 'runwayml--stable-diffusion-v1-5' in result
		assert '/' not in os.path.basename(result)

	def test_get_model_lock_dir(self):
		"""Test get_model_lock_dir returns correct path."""
		service = StorageService()

		model_id = 'stabilityai/stable-diffusion-xl-base-1.0'
		result = service.get_model_lock_dir(model_id)

		# Should replace / with --
		assert 'models--stabilityai--stable-diffusion-xl-base-1.0' in result
		assert result.startswith(os.path.normpath(service.cache_lock_dir) + os.sep)

	def test_get_model_lock_dir_handles_slashes(self):
		"""Test that get_model_lock_dir correctly handles slashes."""
		service = StorageService()

		model_id = 'black-forest-labs/FLUX.1-dev'
		result = service.get_model_lock_dir(model_id)

		# Should replace all / with --
		assert 'black-forest-labs--FLUX.1-dev' in result
		assert '/' not in os.path.basename(result)

	def test_cache_dir_and_lock_dir_set(self):
		"""Test that cache_dir and cache_lock_dir are set on initialization."""
		service = StorageService()

		assert service.cache_dir is not None
		assert service.cache_lock_dir is not None
		assert isinstance(service.cache_dir, str)
		assert isinstance(service.cache_lock_dir, str)

	def test_get_loras_dir(self):
		"""Test get_loras_dir returns correct path."""
		service = StorageService()

		result = service.get_loras_dir()

		# Should be under cache directory
		assert 'loras' in result
		assert service.cache_dir in result or '.cache' in result

	def test_get_lora_file_path(self):
		"""Test get_lora_file_path returns correct file path."""
		service = StorageService()

		filename = 'test_lora.safetensors'
		result = service.get_lora_file_path(filename)

		# Should include loras directory and filename
		assert 'loras' in result
		assert filename in result
		assert result.endswith(filename)

	def test_get_lora_file_path_with_special_characters(self):
		"""Test get_lora_file_path handles special characters in filename."""
		service = StorageService()

		filename = 'lora-special_chars (1).safetensors'
		result = service.get_lora_file_path(filename)

		assert filename in result

	def test_init_creates_loras_directory(self, tmp_path):
		"""Test that init() creates loras directory."""
		service = StorageService()

		# Mock the CACHE_FOLDER to use tmp_path
		with patch('app.services.storage.CACHE_FOLDER', str(tmp_path)):
			service.init()

			# LoRAs directory should be created
			loras_dir = tmp_path / 'loras'
			assert loras_dir.exists()


class TestResolveWithin:
	"""Test resolve_within keeps paths inside their base directory."""

	def test_returns_relative_path_under_base(self):
		assert resolve_within('./.cache', 'loras/a.safetensors') == os.path.join('.cache', 'loras', 'a.safetensors')

	def test_folds_parent_segments_that_stay_inside(self):
		assert resolve_within('static', 'generated_images/../styles/a.png') == os.path.join('static', 'styles', 'a.png')

	@pytest.mark.parametrize('escaping_path', ['../secret.png', 'generated_images/../../secret.png', '/etc/passwd', '.'])
	def test_rejects_paths_outside_base(self, escaping_path):
		with pytest.raises(ValueError):
			resolve_within('static', escaping_path)

	def test_get_lora_file_path_rejects_traversal(self):
		with pytest.raises(ValueError):
			StorageService().get_lora_file_path('../models--x/model.safetensors')
