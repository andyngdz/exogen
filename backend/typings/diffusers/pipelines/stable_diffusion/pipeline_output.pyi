"""Type stubs for diffusers pipeline output."""

from typing import Optional

from PIL import Image

class StableDiffusionPipelineOutput:
	"""Output from Stable Diffusion pipeline."""

	images: list[Image.Image]
	nsfw_content_detected: Optional[list[bool]]

	def __init__(
		self,
		images: list[Image.Image],
		nsfw_content_detected: Optional[list[bool]] = None,
	) -> None: ...
