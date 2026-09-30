"""Safety checker service for NSFW content detection."""

from typing import Optional

import numpy as np
import torch
from diffusers.pipelines.stable_diffusion.safety_checker import StableDiffusionSafetyChecker
from numpy.typing import NDArray
from PIL import Image
from transformers import CLIPImageProcessor

from app.constants.model_loader import CLIP_IMAGE_PROCESSOR_MODEL, SAFETY_CHECKER_MODEL
from app.cores.gpu_utils import clear_device_cache
from app.cores.model_manager import model_manager
from app.database import config_crud
from app.database.service import SessionLocal
from app.services import logger_service

logger = logger_service.get_logger(__name__, category='SafetyCheck')


class SafetyCheckerService:
	"""Service for checking images for NSFW content.

	Handles full lifecycle: database check, model loading, inference, and cleanup.
	Works with all model types (SD 1.5, SDXL, SD3) by running post-generation.
	"""

	_safety_checker: Optional[StableDiffusionSafetyChecker] = None
	_feature_extractor: Optional[CLIPImageProcessor] = None
	_device: Optional[torch.device] = None
	_dtype: Optional[torch.dtype] = None

	def check_images(self, images: list[Image.Image]) -> tuple[list[Image.Image], list[bool]]:
		"""Check images for NSFW content.

		Handles full lifecycle:
		- Reads safety_check_enabled from database
		- Gets device/dtype from model_manager.pipe
		- If disabled: returns images unchanged with [False] flags
		- If enabled: loads model, checks, unloads model

		Args:
			images: List of PIL images to check

		Returns:
			Tuple of (images, nsfw_detected)
			- Images may be blacked out if NSFW detected
			- nsfw_detected is list of bools per image
		"""
		db = SessionLocal()
		try:
			enabled = config_crud.get_safety_check_enabled(db)
		finally:
			db.close()

		if not enabled:
			logger.info('Safety checker disabled by user setting')
			return images, [False] * len(images)

		pipe = model_manager.pipe
		self._load(pipe.device, pipe.dtype)
		try:
			return self._run_check(images)
		finally:
			self._unload()

	def _load(self, device: torch.device, dtype: torch.dtype) -> None:
		"""Load safety checker models to specified device."""
		logger.info(f'Loading safety checker to {device}')

		self._feature_extractor = CLIPImageProcessor.from_pretrained(CLIP_IMAGE_PROCESSOR_MODEL)
		self._safety_checker = StableDiffusionSafetyChecker.from_pretrained(SAFETY_CHECKER_MODEL)
		self._safety_checker.to(device=device, dtype=dtype)

		self._device = device
		self._dtype = dtype

	def _unload(self) -> None:
		"""Unload safety checker to free memory."""
		logger.info('Unloading safety checker to free memory')

		if self._safety_checker is not None:
			del self._safety_checker
			self._safety_checker = None

		if self._feature_extractor is not None:
			del self._feature_extractor
			self._feature_extractor = None

		self._device = None
		self._dtype = None

		clear_device_cache(reason='Safety checker unload')

	def _run_check(self, images: list[Image.Image]) -> tuple[list[Image.Image], list[bool]]:
		"""Run NSFW detection on images.

		Args:
			images: List of PIL images

		Returns:
			Tuple of (checked_images, nsfw_detected)
		"""
		if self._safety_checker is None or self._feature_extractor is None:
			logger.error('Safety checker not loaded')
			return images, [False] * len(images)

		safety_checker_input = self._feature_extractor(images, return_tensors='pt').to(self._device)

		# Convert PIL to numpy (safety checker expects numpy arrays)
		numpy_images: NDArray[np.uint8] = np.stack([np.array(img) for img in images])

		checked_images_np, nsfw_detected = self._safety_checker(
			images=numpy_images,
			clip_input=safety_checker_input.pixel_values.to(self._dtype),
		)

		# Convert numpy back to PIL
		checked_images = [Image.fromarray(img) for img in checked_images_np]

		if any(nsfw_detected):
			nsfw_count = sum(nsfw_detected)
			logger.warning(f'NSFW content detected in {nsfw_count} of {len(nsfw_detected)} image(s)')
		else:
			logger.info('No NSFW content detected')

		return checked_images, nsfw_detected


safety_checker_service = SafetyCheckerService()
