"""Schemas for upscaling operations."""

from dataclasses import dataclass


@dataclass
class UpscaleConfig:
	"""Configuration for AI upscaling operation."""

	batch_size: int
	original_size: str
	upscaler: str
	native_scale: int
	target_scale: float
