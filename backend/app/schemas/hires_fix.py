from enum import Enum

from PIL import Image
from pydantic import BaseModel, Field


class UpscalerType(str, Enum):
	"""Image upscaling methods for high-resolution fix (pixel-space).

	These methods upscale decoded PIL images, not latent tensors.
	This preserves image quality by avoiding interpolation of latent space.

	Includes both traditional PIL interpolation and AI-based upscalers.
	"""

	LANCZOS = 'Lanczos'
	BICUBIC = 'Bicubic'
	BILINEAR = 'Bilinear'
	NEAREST = 'Nearest'
	REALESRGAN_X2PLUS = 'RealESRGAN_x2plus'
	REALESRGAN_X4PLUS = 'RealESRGAN_x4plus'
	REALESRGAN_X4PLUS_ANIME = 'RealESRGAN_x4plus_anime'

	def to_pil_resample(self) -> Image.Resampling:
		"""Convert to PIL resampling mode.

		Only valid for PIL-based upscalers (LANCZOS, BICUBIC, BILINEAR, NEAREST).
		"""
		mapping = {
			UpscalerType.LANCZOS: Image.Resampling.LANCZOS,
			UpscalerType.BICUBIC: Image.Resampling.BICUBIC,
			UpscalerType.BILINEAR: Image.Resampling.BILINEAR,
			UpscalerType.NEAREST: Image.Resampling.NEAREST,
		}
		return mapping[self]


class RemoteModel(BaseModel):
	"""Schema for downloadable model from internet."""

	url: str = Field(..., description='Download URL')
	filename: str = Field(..., description='Local filename to save as')
	scale: int = Field(..., description='Upscaling factor (2 or 4)')


class HiresFixConfig(BaseModel):
	"""Configuration for high-resolution fix (two-pass generation).

	Hires fix generates at base resolution first, then upscales in pixel space,
	and refines with img2img to add details and reduce upscaling blur.
	"""

	upscale_factor: float = Field(
		...,
		ge=1.5,
		le=4.0,
		description='Factor to upscale the image by (e.g., 2.0 means 512x512 → 1024x1024).',
	)
	upscaler: UpscalerType = Field(
		...,
		description='Upscaling method to use.',
	)
	denoising_strength: float = Field(
		...,
		ge=0.0,
		le=1.0,
		description='How much to repaint during refinement (0=keep original, 1=fully repaint).',
	)
	steps: int = Field(
		...,
		ge=0,
		description='Inference steps for hires pass. 0 means use same as main generation.',
	)


class HiresFixRequest(BaseModel):
	"""Request schema for applying hires fix to existing PIL images.

	This is intentionally decoupled from GeneratorConfig / Img2ImgConfig so multiple
	features can reuse hires fix while providing the exact inputs required.

	Note: prompt fields are the *final* prompts (after style application / clipping).
	"""

	hires_fix: HiresFixConfig = Field(..., description='Hires fix configuration.')
	prompt: str = Field(..., max_length=2000, description='Final positive prompt after processing.')
	negative_prompt: str = Field(..., max_length=2000, description='Final negative prompt after processing.')
	cfg_scale: float = Field(default=7.5, ge=1, description='Classifier-Free Guidance scale (CFG scale).')
	clip_skip: int = Field(
		default=1,
		ge=1,
		le=12,
		description='Number of CLIP layers to skip (1=no skip, 2=skip last layer).',
	)
	base_steps: int = Field(..., ge=1, description='Base inference steps from the primary generation pass.')
