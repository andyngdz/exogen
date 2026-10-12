"""Tests for image generation utilities."""

from unittest.mock import Mock, patch

from diffusers.pipelines.stable_diffusion.pipeline_output import StableDiffusionPipelineOutput
from PIL import Image

from app.cores.generation.image_utils import process_generated_images
from app.schemas.generators import ImageGenerationItem


class TestProcessGeneratedImages:
	"""Tests for process_generated_images function."""

	@patch('app.cores.generation.image_utils.memory_manager')
	@patch('app.cores.generation.image_utils.image_processor')
	def test_processes_images_and_returns_results(self, mock_image_processor: Mock, mock_memory_manager: Mock):
		"""Test that images are processed and results returned correctly."""
		# Arrange
		test_image = Image.new('RGB', (64, 64), color='blue')
		mock_output = StableDiffusionPipelineOutput(images=[test_image, test_image], nsfw_content_detected=None)

		mock_image_processor.is_nsfw_content_detected.return_value = [False, False]
		mock_image_processor.save_image.return_value = ('/static/test.png', 'test.png')
		mock_image_processor.clear_tensor_cache = Mock()

		# Act
		items, nsfw_detected = process_generated_images(mock_output)

		# Assert
		assert len(items) == 2
		assert all(isinstance(item, ImageGenerationItem) for item in items)
		assert items[0].path == '/static/test.png'
		assert items[0].file_name == 'test.png'
		assert nsfw_detected == [False, False]

		# Verify cache was cleared
		mock_memory_manager.clear_cache.assert_called()
		mock_image_processor.clear_tensor_cache.assert_called_once()

	@patch('app.cores.generation.image_utils.memory_manager')
	@patch('app.cores.generation.image_utils.image_processor')
	def test_handles_nsfw_content(self, mock_image_processor: Mock, mock_memory_manager: Mock):
		"""Test that NSFW content is detected correctly."""
		# Arrange
		test_image = Image.new('RGB', (64, 64), color='blue')
		mock_output = StableDiffusionPipelineOutput(images=[test_image], nsfw_content_detected=None)

		mock_image_processor.is_nsfw_content_detected.return_value = [True]
		mock_image_processor.save_image.return_value = ('/static/test.png', 'test.png')

		# Act
		items, nsfw_detected = process_generated_images(mock_output)

		# Assert
		assert nsfw_detected == [True]
		assert len(items) == 1

	@patch('app.cores.generation.image_utils.memory_manager')
	@patch('app.cores.generation.image_utils.image_processor')
	def test_clears_cache_between_images(self, mock_image_processor: Mock, mock_memory_manager: Mock):
		"""Test that cache is cleared between processing images."""
		# Arrange
		test_images = [Image.new('RGB', (64, 64), color='blue') for _ in range(3)]
		mock_output = StableDiffusionPipelineOutput(images=test_images, nsfw_content_detected=None)

		mock_image_processor.is_nsfw_content_detected.return_value = [False] * 3
		mock_image_processor.save_image.return_value = ('/static/test.png', 'test.png')

		# Act
		process_generated_images(mock_output)

		# Assert - cache should be cleared: once initially + 2 times between images (not after last)
		assert mock_memory_manager.clear_cache.call_count == 3

	@patch('app.cores.generation.image_utils.memory_manager')
	@patch('app.cores.generation.image_utils.image_processor')
	def test_skips_non_pil_images(self, mock_image_processor: Mock, mock_memory_manager: Mock):
		"""Test that non-PIL Image objects are skipped."""
		# Arrange
		test_image = Image.new('RGB', (64, 64), color='blue')
		non_image_object = 'not an image'
		# Use Mock to create an output with mixed types (intentionally invalid for testing)
		mock_output = Mock()
		mock_output.images = [test_image, non_image_object, test_image]

		mock_image_processor.is_nsfw_content_detected.return_value = [False, False, False]
		mock_image_processor.save_image.return_value = ('/static/test.png', 'test.png')

		# Act
		items, _ = process_generated_images(mock_output)

		# Assert - only 2 images should be processed (non-PIL object skipped)
		assert len(items) == 2
		assert mock_image_processor.save_image.call_count == 2
