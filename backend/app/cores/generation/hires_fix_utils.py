"""Shared utilities for hires fix orchestration."""

import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import Protocol

import torch
from PIL import Image

from app.cores.generation.hires_fix import hires_fix_processor
from app.schemas.hires_fix import HiresFixConfig, HiresFixRequest
from app.schemas.model_loader import DiffusersPipeline
from app.services import logger_service

logger = logger_service.get_logger(__name__, category='HiresFix')


class SupportsUpscalingPhase(Protocol):
	"""Protocol for phase trackers that support upscaling phase."""

	def upscaling(self) -> None:
		"""Emit upscaling phase event."""
		...


class SupportsHiresFixConfig(Protocol):
	"""Protocol for configs that support hires fix."""

	hires_fix: HiresFixConfig | None
	cfg_scale: float
	clip_skip: int
	steps: int


async def apply_hires_fix_common(
	config: SupportsHiresFixConfig,
	positive_prompt: str,
	negative_prompt: str,
	pipe: DiffusersPipeline,
	generator: torch.Generator,
	images: list[Image.Image],
	nsfw_detected: list[bool],
	loop: asyncio.AbstractEventLoop,
	executor: ThreadPoolExecutor,
	phase_tracker: SupportsUpscalingPhase,
) -> list[Image.Image]:
	"""Apply hires fix to safe images only.

	This is a shared implementation used by both text-to-image and img2img generators.

	Args:
		config: Generation config with hires_fix, cfg_scale, clip_skip, steps
		positive_prompt: Final processed positive prompt
		negative_prompt: Final processed negative prompt
		pipe: Diffusion pipeline (img2img compatible)
		generator: Torch generator for reproducibility
		images: Decoded base images
		nsfw_detected: NSFW detection results for each image
		loop: Event loop for async execution
		executor: Thread executor for blocking operations
		phase_tracker: Phase tracker to emit upscaling phase

	Returns:
		Images with hires fix applied to safe ones
	"""
	# Emit upscaling phase
	phase_tracker.upscaling()

	safe_indices = [idx for idx, nsfw in enumerate(nsfw_detected) if not nsfw]

	if not safe_indices:
		logger.warning('All images flagged as NSFW, skipping hires fix')
		return images

	logger.info(f'Applying hires fix to {len(safe_indices)} safe image(s)')

	safe_images = [images[idx] for idx in safe_indices]
	hires_fix = config.hires_fix
	assert hires_fix is not None

	hires_images = await loop.run_in_executor(
		executor,
		lambda: hires_fix_processor.apply(
			HiresFixRequest(
				hires_fix=hires_fix,
				prompt=positive_prompt,
				negative_prompt=negative_prompt,
				cfg_scale=config.cfg_scale,
				clip_skip=config.clip_skip,
				base_steps=config.steps,
			),
			pipe,
			generator,
			safe_images,
		),
	)

	for safe_idx, hires_img in zip(safe_indices, hires_images):
		images[safe_idx] = hires_img

	logger.info('Hires fix applied successfully')
	return images
