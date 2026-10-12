from pydantic import BaseModel, Field

from app.constants.img2img import IMG2IMG_DEFAULT_STRENGTH
from app.cores.samplers import SamplerType
from app.cores.typing_utils import make_default_list_factory
from app.schemas.generators import (
	ImageGenerationItem,
	ImageGenerationResponse,
	ImageGenerationStepEndResponse,
)
from app.schemas.hires_fix import HiresFixConfig
from app.schemas.loras import LoRAConfigItem
from app.services.styles import DEFAULT_NEGATIVE_PROMPT


class Img2ImgConfig(BaseModel):
	"""Configuration for image-to-image generation."""

	# Image-specific parameters
	init_image: str = Field(..., description='Base64 encoded source image.')
	strength: float = Field(
		default=IMG2IMG_DEFAULT_STRENGTH,
		ge=0.0,
		le=1.0,
		description='Strength of transformation (0=no change, 1=complete change).',
	)
	resize_mode: str = Field(
		default='resize', description='How to handle image size: "resize" (stretch) or "crop" (center crop).'
	)

	# Generation parameters (same as text-to-image)
	width: int = Field(default=512, ge=64, description='Width of the generated image.')
	height: int = Field(default=512, ge=64, description='Height of the generated image.')
	hires_fix: HiresFixConfig | None = Field(default=None, description='High-resolution fix configuration.')
	number_of_images: int = Field(default=1, ge=1, description='Number of images to generate.')
	prompt: str = Field(..., max_length=1000, description='The text prompt for image generation.')
	negative_prompt: str = Field(
		default=DEFAULT_NEGATIVE_PROMPT, max_length=1000, description='Negative prompt to avoid certain features.'
	)
	cfg_scale: float = Field(default=7.5, ge=1, description='Classifier-Free Guidance scale.')
	steps: int = Field(default=24, ge=1, description='Number of inference steps.')
	seed: int = Field(default=-1, description='Random seed for reproducibility.')
	sampler: SamplerType = Field(default=SamplerType.EULER_A, description='Sampler type for image generation.')
	styles: list[str] = Field(
		default_factory=make_default_list_factory(str),
		description='List of styles to apply.',
	)
	loras: list[LoRAConfigItem] = Field(
		default_factory=make_default_list_factory(LoRAConfigItem),
		description='List of LoRAs to apply during generation with individual weights.',
	)
	clip_skip: int = Field(
		default=1,
		ge=1,
		le=12,
		description='Number of CLIP layers to skip (1=no skip, 2=skip last layer). Required for some LoRAs.',
	)


class Img2ImgRequest(BaseModel):
	history_id: int = Field(..., description='History ID for tracking the generation process.')
	config: Img2ImgConfig = Field(..., description='Configuration for img2img generation.')


__all__ = [
	'Img2ImgConfig',
	'Img2ImgRequest',
	'ImageGenerationItem',
	'ImageGenerationResponse',
	'ImageGenerationStepEndResponse',
]
