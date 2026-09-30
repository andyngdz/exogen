"""Response building shared by generation features."""

from diffusers.pipelines.stable_diffusion.pipeline_output import StableDiffusionPipelineOutput

from app.cores.generation.image_utils import process_generated_images
from app.schemas.generators import ImageGenerationResponse


class ResponseBuilder:
	"""Builds ImageGenerationResponse from pipeline output."""

	def build_response(self, output: StableDiffusionPipelineOutput) -> ImageGenerationResponse:
		"""Build response from pipeline output."""
		items, nsfw_content_detected = process_generated_images(output)

		return ImageGenerationResponse(
			items=items,
			nsfw_content_detected=nsfw_content_detected,
		)


response_builder = ResponseBuilder()
