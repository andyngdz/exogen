from enum import Enum

from pydantic import BaseModel, Field


class UpscalingMethod(str, Enum):
	"""Upscaling method type indicator."""

	TRADITIONAL = 'traditional'
	AI = 'ai'


class UpscalerItem(BaseModel):
	"""An upscaler option with metadata."""

	value: str = Field(..., description='Internal enum value')
	name: str = Field(..., description='Display name')
	description: str = Field(..., description='Brief description')
	suggested_denoise_strength: float = Field(
		..., ge=0.0, le=1.0, description='Suggested denoise strength for composition preservation'
	)
	method: UpscalingMethod = Field(..., description='Upscaling method type (traditional or AI)')
	is_recommended: bool = Field(..., description='Whether this upscaler is recommended for typical use')


class UpscalerSection(BaseModel):
	"""A section grouping upscalers by method."""

	method: UpscalingMethod = Field(..., description='Upscaling method type')
	title: str = Field(..., description='Display title for the section')
	options: list[UpscalerItem] = Field(..., description='Upscaler options in this section')


class ConfigResponse(BaseModel):
	"""Complete config response."""

	upscalers: list[UpscalerSection] = Field(..., description='Upscaler sections grouped by method')
	safety_check_enabled: bool = Field(..., description='Whether safety check is enabled for image generation')
	gpu_scale_factor: float = Field(..., ge=0.1, le=1.0, description='Maximum GPU memory scale factor')
	ram_scale_factor: float = Field(..., ge=0.1, le=1.0, description='Maximum RAM memory scale factor')
	total_gpu_memory: int = Field(..., description='Total GPU memory in bytes')
	total_ram_memory: int = Field(..., description='Total RAM memory in bytes')
	device_index: int = Field(..., description='Index of the selected device. 0+ for GPU index, -1 for CPU mode')


class SafetyCheckRequest(BaseModel):
	"""Request to update safety check setting."""

	enabled: bool = Field(..., description='Whether to enable safety check')


class DeviceRequest(BaseModel):
	"""Request to set the active device."""

	device_index: int = Field(..., ge=-1, description='Device index to select. 0+ for GPU index, -1 for CPU mode')


class MaxMemoryRequest(BaseModel):
	"""Request to set memory scale factors."""

	gpu_scale_factor: float = Field(..., ge=0.1, le=1.0, description='Maximum GPU memory scale factor')
	ram_scale_factor: float = Field(..., ge=0.1, le=1.0, description='Maximum RAM memory scale factor')
