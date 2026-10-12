"""Shared utilities for image generation processing."""

from __future__ import annotations

from diffusers.pipelines.stable_diffusion.pipeline_output import StableDiffusionPipelineOutput
from PIL.Image import Image

from app.cores.generation import image_processor, memory_manager
from app.schemas.generators import ImageGenerationItem


def process_generated_images(output: StableDiffusionPipelineOutput) -> tuple[list[ImageGenerationItem], list[bool]]:
	"""Process generated images and save them to disk.

	Args:
		output: Pipeline output containing generated images

	Returns:
		Tuple of (image_items, nsfw_content_detected)
	"""

	# Clear preview generation cache immediately after generation completes
	image_processor.clear_tensor_cache()

	# Clear CUDA cache before accessing final images to maximize available memory
	memory_manager.clear_cache()

	# Now safe to access images with more memory available
	nsfw_content_detected = image_processor.is_nsfw_content_detected(output)

	generated_images = output.images
	items: list[ImageGenerationItem] = []

	# Process and save images one at a time to minimize memory usage
	for i, image in enumerate(generated_images):
		if isinstance(image, Image):
			# Save image to disk (preserves file for history)
			path, file_name = image_processor.save_image(image)
			items.append(ImageGenerationItem(path=path, file_name=file_name))

			# Delete the image from memory after saving
			del image

			# Clear cache after each image to prevent buildup
			if i < len(generated_images) - 1:  # Skip on last iteration
				memory_manager.clear_cache()

	return items, nsfw_content_detected
