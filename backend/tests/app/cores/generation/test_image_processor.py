"""Tests for image_processor module."""

import os
from datetime import datetime
from unittest.mock import patch

import numpy as np
import pytest
import torch
from diffusers.pipelines.stable_diffusion.pipeline_output import StableDiffusionPipelineOutput
from PIL import Image

from app.cores.generation.image_processor import image_processor as img_processor


@pytest.fixture
def image_processor():
	"""Get the image_processor singleton."""
	from app.cores.generation.image_processor import image_processor

	return image_processor


class TestIsNsfwContentDetected:
	def test_returns_nsfw_flags_when_detected(self, image_processor):
		placeholder_images = [Image.new('RGB', (1, 1))] * 3
		output = StableDiffusionPipelineOutput(nsfw_content_detected=[True, False, True], images=placeholder_images)

		result = image_processor.is_nsfw_content_detected(output)

		assert result == [True, False, True]

	def test_returns_false_list_when_no_nsfw(self, image_processor):
		placeholder_images = [Image.new('RGB', (1, 1))] * 2
		output = StableDiffusionPipelineOutput(nsfw_content_detected=None, images=placeholder_images)

		result = image_processor.is_nsfw_content_detected(output)

		assert result == [False, False]

	def test_handles_empty_images_list(self, image_processor):
		output = StableDiffusionPipelineOutput(nsfw_content_detected=None, images=[])

		result = image_processor.is_nsfw_content_detected(output)

		assert result == []


class TestGenerateFileName:
	def test_generates_timestamp_based_filename(self, image_processor):
		filename = image_processor.generate_file_name()

		# Check format: YYYYMMDD_HHMMSS_ffffff (22 chars total)
		assert len(filename) == 22
		assert filename[8] == '_'
		assert filename[15] == '_'
		# Verify it's a valid datetime format
		datetime.strptime(filename, '%Y%m%d_%H%M%S_%f')


class TestSaveImage:
	def test_raises_value_error_when_image_is_none(self, image_processor):
		with pytest.raises(ValueError, match='Failed to generate any image'):
			image_processor.save_image(None)

	def test_saves_image_and_returns_paths(self, tmp_path, monkeypatch):
		# Create a test image
		test_image = Image.new('RGB', (64, 64), color='red')

		# Mock the paths
		generated_folder = tmp_path / 'generated'
		static_folder = tmp_path / 'static/generated_images'
		generated_folder.mkdir(parents=True, exist_ok=True)
		static_folder.mkdir(parents=True, exist_ok=True)

		# Monkeypatch at config level
		import sys

		img_proc_module = sys.modules['app.cores.generation.image_processor']
		monkeypatch.setattr(img_proc_module, 'GENERATED_IMAGES_FOLDER', str(generated_folder))
		monkeypatch.setattr(img_proc_module, 'GENERATED_IMAGES_STATIC_FOLDER', str(static_folder))

		# Now get the processor (after patching)
		from app.cores.generation.image_processor import image_processor

		static_path, file_name = image_processor.save_image(test_image)

		# Verify file was created
		assert os.path.exists(os.path.join(generated_folder, f'{file_name}.png'))
		assert static_path == os.path.join(str(static_folder), f'{file_name}.png')


class TestLatentsToRgb:
	def test_converts_latent_tensor_to_rgb_image(self, image_processor):
		# Create a real latent tensor (4 channels for latent space)
		latents = torch.randn(4, 8, 8)

		result = image_processor.latents_to_rgb(latents)

		assert isinstance(result, Image.Image)
		assert result.mode == 'RGB'
		assert result.size == (8, 8)  # Width x Height

	def test_handles_different_latent_sizes(self, image_processor):
		# Test with larger latent tensor
		latents = torch.randn(4, 16, 16)

		result = image_processor.latents_to_rgb(latents)

		assert isinstance(result, Image.Image)
		assert result.size == (16, 16)


class TestClearTensorCache:
	"""Test clear_tensor_cache() method."""

	def test_clears_cached_weights_and_biases(self, image_processor):
		"""Test clearing cached tensors (lines 58-70)."""
		# Setup - add cached tensors
		image_processor.cached_weights['layer1'] = torch.randn(10, 10)
		image_processor.cached_weights['layer2'] = torch.randn(20, 20)
		image_processor.cached_biases['bias1'] = torch.randn(10)

		# Execute
		image_processor.clear_tensor_cache()

		# Verify caches are empty
		assert len(image_processor.cached_weights) == 0
		assert len(image_processor.cached_biases) == 0

	@patch('app.cores.generation.image_processor.clear_device_cache')
	def test_invokes_shared_cache_helper(self, mock_clear_cache, image_processor):
		"""Clear tensor cache should route through shared cache helper."""
		image_processor.cached_weights['test'] = torch.randn(5, 5)

		image_processor.clear_tensor_cache()

		mock_clear_cache.assert_called_once_with(reason='Image processor tensor cache')


class TestPilToBgrNumpy:
	def test_converts_rgb_to_bgr(self):
		"""Test PIL to numpy conversion produces BGR array."""
		pil_image = Image.new('RGB', (100, 100), color=(255, 0, 0))  # Red in RGB

		numpy_array = img_processor.pil_to_bgr_numpy(pil_image)

		assert numpy_array.shape == (100, 100, 3)
		assert numpy_array[0, 0, 0] == 0  # Blue channel should be 0
		assert numpy_array[0, 0, 2] == 255  # Red channel should be 255


class TestBgrNumpyToPil:
	def test_converts_bgr_to_rgb(self):
		"""Test numpy to PIL conversion produces RGB image."""
		bgr_array = np.zeros((100, 100, 3), dtype=np.uint8)
		bgr_array[:, :, 0] = 255  # Blue channel in BGR

		pil_image = img_processor.bgr_numpy_to_pil(bgr_array)

		assert pil_image.size == (100, 100)
		assert pil_image.mode == 'RGB'
		# BGR [255, 0, 0] -> RGB [0, 0, 255] (blue)
		assert pil_image.getpixel((0, 0)) == (0, 0, 255)
