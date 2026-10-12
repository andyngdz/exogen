import base64
import io

import pytest
from PIL import Image

from app.services.image import image_service


class TestImageService:
	"""Tests for ImageService class."""

	def test_from_base64_with_plain_base64(self):
		"""Test decoding a plain base64 string."""
		# Create a test image
		test_image = Image.new('RGB', (100, 100), color='red')
		buffer = io.BytesIO()
		test_image.save(buffer, format='PNG')
		image_bytes = buffer.getvalue()
		base64_string = base64.b64encode(image_bytes).decode('utf-8')

		# Decode
		result = image_service.from_base64(base64_string)

		assert isinstance(result, Image.Image)
		assert result.mode == 'RGB'
		assert result.size == (100, 100)

	def test_from_base64_with_data_uri(self):
		"""Test decoding a base64 string with data URI prefix."""
		# Create a test image
		test_image = Image.new('RGB', (100, 100), color='blue')
		buffer = io.BytesIO()
		test_image.save(buffer, format='PNG')
		image_bytes = buffer.getvalue()
		base64_string = base64.b64encode(image_bytes).decode('utf-8')
		data_uri = f'data:image/png;base64,{base64_string}'

		# Decode
		result = image_service.from_base64(data_uri)

		assert isinstance(result, Image.Image)
		assert result.mode == 'RGB'
		assert result.size == (100, 100)

	def test_from_base64_with_rgba_conversion(self):
		"""Test that RGBA images are converted to RGB."""
		# Create an RGBA test image
		test_image = Image.new('RGBA', (100, 100), color=(255, 0, 0, 128))
		buffer = io.BytesIO()
		test_image.save(buffer, format='PNG')
		image_bytes = buffer.getvalue()
		base64_string = base64.b64encode(image_bytes).decode('utf-8')

		# Decode
		result = image_service.from_base64(base64_string)

		assert result.mode == 'RGB'
		assert result.size == (100, 100)

	def test_from_base64_with_invalid_base64(self):
		"""Test that invalid base64 raises ValueError."""
		with pytest.raises(ValueError, match='Failed to decode base64 image'):
			image_service.from_base64('invalid-base64-string!!!')

	def test_resize_image_with_resize_mode(self):
		"""Test simple resize mode (may change aspect ratio)."""
		test_image = Image.new('RGB', (200, 100), color='green')

		result = image_service.resize_image(test_image, 100, 100, mode='resize')

		assert result.size == (100, 100)

	def test_resize_image_with_crop_mode_wider_image(self):
		"""Test crop mode with a wider image (crops width)."""
		test_image = Image.new('RGB', (400, 200), color='yellow')

		result = image_service.resize_image(test_image, 100, 100, mode='crop')

		assert result.size == (100, 100)

	def test_resize_image_with_crop_mode_taller_image(self):
		"""Test crop mode with a taller image (crops height)."""
		test_image = Image.new('RGB', (200, 400), color='purple')

		result = image_service.resize_image(test_image, 100, 100, mode='crop')

		assert result.size == (100, 100)

	def test_resize_image_with_invalid_mode(self):
		"""Test that invalid resize mode raises ValueError."""
		test_image = Image.new('RGB', (200, 200), color='black')

		with pytest.raises(ValueError, match='Invalid resize mode'):
			image_service.resize_image(test_image, 100, 100, mode='invalid_mode')
