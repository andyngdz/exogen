"""Tests for traditional upscaler."""

from unittest.mock import MagicMock, patch

import pytest
import torch
from PIL import Image

from app.cores.upscalers.traditional.upscaler import TraditionalUpscaler
from app.schemas.hires_fix import HiresFixConfig, HiresFixRequest, UpscalerType


class TestPilUpscaling:
	"""Test PIL upscaling functionality."""

	@pytest.fixture
	def upscaler(self):
		"""Create upscaler instance."""
		return TraditionalUpscaler()

	@pytest.fixture
	def sample_images(self):
		"""Create sample PIL images [512x512]."""
		return [Image.new('RGB', (512, 512), color='red')]

	def test_upscale_2x_lanczos(self, upscaler, sample_images):
		"""Test 2x upscaling with Lanczos method."""
		result = upscaler._upscale_pil(sample_images, scale_factor=2.0, upscaler_type=UpscalerType.LANCZOS)

		assert len(result) == 1
		assert result[0].size == (1024, 1024)
		assert result[0].mode == 'RGB'

	def test_upscale_1_5x_bicubic(self, upscaler, sample_images):
		"""Test 1.5x upscaling with Bicubic method."""
		result = upscaler._upscale_pil(sample_images, scale_factor=1.5, upscaler_type=UpscalerType.BICUBIC)

		assert len(result) == 1
		assert result[0].size == (768, 768)

	def test_upscale_bilinear(self, upscaler, sample_images):
		"""Test upscaling with Bilinear method."""
		result = upscaler._upscale_pil(sample_images, scale_factor=2.0, upscaler_type=UpscalerType.BILINEAR)

		assert len(result) == 1
		assert result[0].size == (1024, 1024)

	def test_upscale_nearest(self, upscaler, sample_images):
		"""Test upscaling with Nearest method."""
		result = upscaler._upscale_pil(sample_images, scale_factor=2.0, upscaler_type=UpscalerType.NEAREST)

		assert len(result) == 1
		assert result[0].size == (1024, 1024)

	def test_upscale_batch(self, upscaler):
		"""Test upscaling with batch size > 1."""
		images = [Image.new('RGB', (512, 512), color='red') for _ in range(3)]
		result = upscaler._upscale_pil(images, scale_factor=2.0, upscaler_type=UpscalerType.LANCZOS)

		assert len(result) == 3
		for img in result:
			assert img.size == (1024, 1024)

	def test_different_aspect_ratios(self, upscaler):
		"""Test upscaling with non-square images."""
		images = [Image.new('RGB', (512, 768), color='blue')]
		result = upscaler._upscale_pil(images, scale_factor=2.0, upscaler_type=UpscalerType.LANCZOS)

		assert len(result) == 1
		assert result[0].size == (1024, 1536)


class TestUpscaleWithRefinement:
	"""Test upscale method that includes refinement."""

	@pytest.fixture
	def upscaler(self):
		"""Create upscaler instance."""
		return TraditionalUpscaler()

	@pytest.fixture
	def sample_images(self):
		"""Create sample PIL images."""
		return [Image.new('RGB', (512, 512), color='red')]

	@pytest.fixture
	def hires_request(self):
		"""Create hires fix request."""
		return HiresFixRequest(
			hires_fix=HiresFixConfig(
				upscale_factor=2.0,
				upscaler=UpscalerType.LANCZOS,
				denoising_strength=0.7,
				steps=15,
			),
			prompt='final prompt',
			negative_prompt='final negative',
			cfg_scale=7.5,
			clip_skip=1,
			base_steps=20,
		)

	def test_upscale_empty_list(self, upscaler, hires_request):
		"""Test that empty image list returns empty list."""
		mock_pipe = MagicMock()
		generator = torch.Generator().manual_seed(42)

		result = upscaler.upscale(
			hires_request,
			mock_pipe,
			generator,
			[],
		)

		assert result == []

	def test_uses_hires_steps_when_nonzero(self, upscaler, sample_images, hires_request):
		"""Test that hires_steps > 0 is used directly."""
		mock_pipe = MagicMock()
		mock_output = MagicMock()
		mock_output.images = [Image.new('RGB', (1024, 1024))]
		mock_pipe.return_value = mock_output
		generator = torch.Generator().manual_seed(42)

		with patch('app.cores.upscalers.traditional.upscaler.img2img_refiner') as mock_refiner:
			mock_refiner.refine.return_value = [Image.new('RGB', (1024, 1024))]

			upscaler.upscale(
				hires_request,
				mock_pipe,
				generator,
				sample_images,
			)

			call_args = mock_refiner.refine.call_args[0]
			assert call_args[4] == 15  # steps parameter

	def test_uses_base_steps_when_hires_steps_zero(self, upscaler, sample_images, hires_request):
		"""Test that hires_steps=0 falls back to config.steps."""
		mock_pipe = MagicMock()
		mock_output = MagicMock()
		mock_output.images = [Image.new('RGB', (1024, 1024))]
		mock_pipe.return_value = mock_output
		generator = torch.Generator().manual_seed(42)

		with patch('app.cores.upscalers.traditional.upscaler.img2img_refiner') as mock_refiner:
			mock_refiner.refine.return_value = [Image.new('RGB', (1024, 1024))]

			request = HiresFixRequest(
				hires_fix=HiresFixConfig(
					upscale_factor=2.0,
					upscaler=UpscalerType.LANCZOS,
					denoising_strength=0.7,
					steps=0,
				),
				prompt='final prompt',
				negative_prompt='final negative',
				cfg_scale=7.5,
				clip_skip=1,
				base_steps=20,
			)

			upscaler.upscale(
				request,
				mock_pipe,
				generator,
				sample_images,
			)

			call_args = mock_refiner.refine.call_args[0]
			assert call_args[4] == 20  # falls back to config.steps
