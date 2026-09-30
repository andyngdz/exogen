from enum import Enum

from pydantic import BaseModel, Field


class GenerationPhase(str, Enum):
	"""Enum for major phases during image generation."""

	IMAGE_GENERATION = 'image_generation'
	UPSCALING = 'upscaling'
	COMPLETED = 'completed'


class SocketEvents(str, Enum):
	"""
	Enum for the state of a model download.
	Using str as base class ensures it serializes to string in JSON.
	"""

	DOWNLOAD_START = 'download_start'
	DOWNLOAD_STEP_PROGRESS = 'download_step_progress'
	DOWNLOAD_COMPLETED = 'download_completed'

	MODEL_LOAD_STARTED = 'model_load_started'
	MODEL_LOAD_PROGRESS = 'model_load_progress'
	MODEL_LOAD_COMPLETED = 'model_load_completed'
	MODEL_LOAD_FAILED = 'model_load_failed'
	IMAGE_GENERATION_STEP_END = 'image_generation_step_end'
	GENERATION_PHASE = 'generation_phase'


class SocketResponse(BaseModel):
	"""
	Base response model for WebSocket events.
	"""

	event: SocketEvents

	data: dict


class GenerationPhaseResponse(BaseModel):
	"""Response model for generation phase events."""

	phases: list[GenerationPhase] = Field(..., description='List of phases in the generation pipeline.')
	current: GenerationPhase = Field(..., description='Current active phase.')
