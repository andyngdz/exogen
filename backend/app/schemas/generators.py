from dataclasses import dataclass
from enum import Enum
from typing import Callable, Optional, Protocol

import torch
from PIL import Image
from pydantic import BaseModel, Field

from app.cores.samplers import SamplerType
from app.cores.typing_utils import make_default_list_factory
from app.schemas.hires_fix import HiresFixConfig
from app.schemas.loras import LoRAConfigItem


class OutputType(str, Enum):
	"""Output format for diffusion pipeline."""

	PIL = 'pil'
	LATENT = 'latent'
	NUMPY = 'np'
	TENSOR = 'pt'


class SupportsPrompts(Protocol):
	"""Protocol for configs that contain prompt information."""

	prompt: str
	negative_prompt: str
	styles: list[str]


@dataclass
class BasePipelineParams:
	"""Common parameters shared by all pipeline types."""

	prompt: str
	negative_prompt: str
	num_inference_steps: int
	guidance_scale: float
	generator: torch.Generator
	clip_skip: int
	output_type: OutputType


@dataclass
class Text2ImgParams(BasePipelineParams):
	"""Parameters for text-to-image generation."""

	height: int
	width: int
	num_images_per_prompt: int
	callback_on_step_end: Callable[..., dict]
	callback_on_step_end_tensor_inputs: list[str]


@dataclass
class Img2ImgParams(BasePipelineParams):
	"""Parameters for image-to-image (hires fix) generation.

	Supports both latent-space (legacy) and pixel-space img2img:
	- For pixel-space: pass `image` (PIL images)
	- For latent-space: pass `latents` (torch.Tensor)
	"""

	strength: float
	num_images_per_prompt: int
	height: int
	width: int
	image: Optional[list[Image.Image]] = None
	latents: Optional[torch.Tensor] = None


# Default negative prompt to avoid circular import with app.services.styles
_DEFAULT_NEGATIVE_PROMPT = (
	'(worst quality, low quality, lowres, blurry, jpeg artifacts, watermark, '
	'signature, text, logo), '
	'(bad hands, bad anatomy, mutated, deformed, disfigured, extra limbs, '
	'cropped, out of frame), '
	'(cartoon, anime, cgi, render, 3d, doll, toy, painting, sketch)'
)


class GeneratorConfig(BaseModel):
	"""Request model for generating an image."""

	width: int = Field(default=512, ge=64, description='Width of the generated image.')
	height: int = Field(default=512, ge=64, description='Height of the generated image.')
	hires_fix: Optional[HiresFixConfig] = Field(default=None, description='High-resolution fix configuration.')
	number_of_images: int = Field(default=1, ge=1, description='Number of images to generate.')
	prompt: str = Field(..., max_length=1000, description='The text prompt for image generation.')
	negative_prompt: str = Field(
		default=_DEFAULT_NEGATIVE_PROMPT, max_length=1000, description='Negative prompt to avoid certain features.'
	)
	cfg_scale: float = Field(default=7.5, ge=1, description='Classifier-Free Guidance scale (CFG scale).')
	steps: int = Field(default=24, ge=1, description='Number of inference steps.')
	seed: int = Field(default=-1, description='Random seed for reproducibility.')
	sampler: SamplerType = Field(
		default=SamplerType.EULER_A,
		description='Sampler type for image generation.',
	)
	styles: list[str] = Field(
		default_factory=make_default_list_factory(str),
		description='List of styles to apply to the generated image.',
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


class ImageGenerationRequest(BaseModel):
	history_id: int = Field(..., description='History ID for tracking the generation process.')
	config: GeneratorConfig = Field(..., description='Configuration for image generation.')


class ImageGenerationStepEndResponse(BaseModel):
	index: int = Field(..., description='Index of the step in the generation process.')
	current_step: int = Field(..., description='Current step number in the generation process.')
	timestep: float = Field(..., description='Current timestep in the generation process.')
	image_base64: str = Field(..., description='Base64 encoded image generated at this step.')


class ImageGenerationItem(BaseModel):
	path: str = Field(..., description='Path to the generated image file.')
	file_name: str = Field(..., description='Name of the generated image file.')


class ImageGenerationResponse(BaseModel):
	items: list[ImageGenerationItem] = Field(
		default_factory=make_default_list_factory(ImageGenerationItem),
		description='List of images with their paths and file names.',
	)
	nsfw_content_detected: list[bool] = Field(
		default_factory=make_default_list_factory(bool),
		description='Indicates if the generated image is NSFW (Not Safe For Work).',
	)
