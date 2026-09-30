"""Tests for img2img refiner."""

from unittest.mock import MagicMock

import pytest
import torch
from PIL import Image

from app.cores.upscalers.traditional.refiner import Img2ImgRefiner
from app.schemas.hires_fix import HiresFixConfig, HiresFixRequest, UpscalerType


class TestImg2ImgRefiner:
	"""Test img2img refinement functionality."""

	@pytest.fixture
	def refiner(self):
		"""Create refiner instance."""
		return Img2ImgRefiner()

	@pytest.fixture
	def sample_images(self):
		"""Create sample upscaled PIL images [1024x1024]."""
		return [Image.new('RGB', (1024, 1024), color='red')]

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
			prompt='test prompt',
			negative_prompt='bad quality',
			cfg_scale=7.5,
			clip_skip=1,
			base_steps=20,
		)

	@pytest.fixture
	def mock_pipe(self):
		"""Create mock diffusion pipeline."""
		mock = MagicMock()
		mock_output = MagicMock()
		mock_output.images = [Image.new('RGB', (1024, 1024))]
		mock.return_value = mock_output
		return mock

	def test_refine_returns_images(self, refiner, sample_images, hires_request, mock_pipe):
		"""Test that refine returns refined images."""
		generator = torch.Generator().manual_seed(42)

		result = refiner.refine(
			request=hires_request,
			pipe=mock_pipe,
			generator=generator,
			images=sample_images,
			steps=15,
			denoising_strength=0.7,
		)

		assert len(result) == 1
		assert isinstance(result[0], Image.Image)
		mock_pipe.assert_called_once()

	def test_refine_passes_correct_params(self, refiner, sample_images, hires_request, mock_pipe):
		"""Test that refine passes correct parameters to pipeline."""
		generator = torch.Generator().manual_seed(42)

		refiner.refine(
			request=hires_request,
			pipe=mock_pipe,
			generator=generator,
			images=sample_images,
			steps=15,
			denoising_strength=0.7,
		)

		call_kwargs = mock_pipe.call_args[1]
		assert call_kwargs['prompt'] == 'test prompt'
		assert call_kwargs['negative_prompt'] == 'bad quality'
		assert call_kwargs['num_inference_steps'] == 15
		assert call_kwargs['guidance_scale'] == 7.5
		assert call_kwargs['strength'] == 0.7
		assert call_kwargs['height'] == 1024
		assert call_kwargs['width'] == 1024

	def test_refine_batch_images(self, refiner, hires_request, mock_pipe):
		"""Test that refine handles batch of images."""
		images = [Image.new('RGB', (1024, 1024), color='red') for _ in range(3)]
		mock_output = MagicMock()
		mock_output.images = [Image.new('RGB', (1024, 1024)) for _ in range(3)]
		mock_pipe.return_value = mock_output

		generator = torch.Generator().manual_seed(42)

		result = refiner.refine(
			request=hires_request,
			pipe=mock_pipe,
			generator=generator,
			images=images,
			steps=15,
			denoising_strength=0.7,
		)

		assert len(result) == 3
		call_kwargs = mock_pipe.call_args[1]
		assert call_kwargs['num_images_per_prompt'] == 3
