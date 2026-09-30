"""Latent decoding utilities using pipeline components."""

import torch
from PIL import Image

from app.schemas.generators import OutputType
from app.schemas.model_loader import DiffusersPipeline


class LatentDecoder:
	"""Decodes latent tensors to PIL images using pipeline's VAE."""

	def decode_latents(self, pipe: DiffusersPipeline, latents: torch.Tensor) -> list[Image.Image]:
		"""Decode latent tensor to PIL images using pipeline's VAE.

		Args:
			pipe: The diffusion pipeline (has vae, image_processor)
			latents: Latent tensor [B, 4, H, W]

		Returns:
			List of PIL images
		"""
		with torch.no_grad():
			scaled_latents = latents / pipe.vae.config.scaling_factor
			decoder_output = pipe.vae.decode(scaled_latents)
			result = pipe.image_processor.postprocess(decoder_output.sample, output_type=OutputType.PIL.value)

		# When output_type=PIL, postprocess returns list[Image.Image]
		assert isinstance(result, list)
		return result


latent_decoder = LatentDecoder()
