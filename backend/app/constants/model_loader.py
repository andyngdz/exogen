from enum import StrEnum

SAFETY_CHECKER_MODEL = 'CompVis/stable-diffusion-safety-checker'
CLIP_IMAGE_PROCESSOR_MODEL = 'openai/clip-vit-base-patch32'


class ModelLoadingStrategy(StrEnum):
	"""Enum for model loading strategy types."""

	SINGLE_FILE = 'single_file'
	PRETRAINED = 'pretrained'
