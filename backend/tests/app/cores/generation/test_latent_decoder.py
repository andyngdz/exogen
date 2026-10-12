"""Tests for latent_decoder module."""

from unittest.mock import Mock

import pytest
import torch
from PIL import Image


@pytest.fixture
def mock_pipe():
	"""Create a mock pipeline with VAE and image processor."""
	pipe = Mock()
	pipe.device = torch.device('cpu')
	pipe.dtype = torch.float32

	# Mock VAE
	pipe.vae = Mock()
	pipe.vae.config = Mock()
	pipe.vae.config.scaling_factor = 0.18215
	mock_decoder_output = Mock()
	mock_decoder_output.sample = Mock()
	pipe.vae.decode = Mock(return_value=mock_decoder_output)

	# Mock image processor
	pipe.image_processor = Mock()
	mock_image = Mock(spec=Image.Image)
	pipe.image_processor.postprocess = Mock(return_value=[mock_image])

	return pipe


@pytest.fixture
def sample_latents():
	"""Create sample latent tensor."""
	return torch.randn(1, 4, 64, 64)


class TestDecodeLatents:
	"""Test decode_latents() method."""

	def test_decodes_latents_successfully(self, mock_pipe, sample_latents):
		"""Test successful latent decoding (happy path)."""
		from app.cores.generation.latent_decoder import latent_decoder

		result = latent_decoder.decode_latents(mock_pipe, sample_latents)

		# Verify VAE decode was called
		mock_pipe.vae.decode.assert_called_once()

		# Verify image processor postprocess was called
		mock_pipe.image_processor.postprocess.assert_called_once()

		# Verify result is list of images
		assert isinstance(result, list)
		assert len(result) > 0

	def test_scales_latents_before_decode(self, mock_pipe, sample_latents):
		"""Test that latents are scaled by VAE scaling factor."""
		from app.cores.generation.latent_decoder import latent_decoder

		latent_decoder.decode_latents(mock_pipe, sample_latents)

		# Get the tensor that was passed to vae.decode
		call_args = mock_pipe.vae.decode.call_args
		scaled_latents = call_args[0][0]

		# Verify scaling was applied
		expected_scale = 1.0 / mock_pipe.vae.config.scaling_factor
		expected_latents = sample_latents * expected_scale

		assert torch.allclose(scaled_latents, expected_latents, atol=1e-6)

	def test_calls_postprocess_with_pil_output_type(self, mock_pipe, sample_latents):
		"""Test that postprocess is called with output_type='pil'."""
		from app.cores.generation.latent_decoder import latent_decoder

		latent_decoder.decode_latents(mock_pipe, sample_latents)

		# Verify postprocess was called with correct output_type
		call_kwargs = mock_pipe.image_processor.postprocess.call_args[1]
		assert call_kwargs.get('output_type') == 'pil'
