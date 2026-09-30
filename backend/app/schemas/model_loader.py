from collections.abc import Mapping
from enum import Enum
from typing import Literal, Optional, Protocol, TypeAlias, Union

import torch
from diffusers.pipelines.auto_pipeline import AutoPipelineForImage2Image, AutoPipelineForText2Image
from diffusers.pipelines.stable_diffusion import StableDiffusionPipeline
from diffusers.pipelines.stable_diffusion_3.pipeline_stable_diffusion_3 import StableDiffusion3Pipeline
from diffusers.pipelines.stable_diffusion_xl import StableDiffusionXLPipeline
from PIL import Image
from pydantic import BaseModel, Field


class ModelLoadPhase(str, Enum):
	"""
	Enum for the different phases of model loading.
	Using str as base class ensures it serializes to string in JSON.
	"""

	INITIALIZATION = 'initialization'
	LOADING_MODEL = 'loading_model'
	DEVICE_SETUP = 'device_setup'
	OPTIMIZATION = 'optimization'


class ModelLoadProgressResponse(BaseModel):
	"""Response model for model loading progress updates."""

	model_id: str = Field(..., description='The ID of the model being loaded.')
	step: int = Field(..., description='Current checkpoint (1-8).')
	total: int = Field(default=8, description='Total checkpoints.')
	phase: ModelLoadPhase = Field(..., description='Current loading phase.')
	message: str = Field(..., description='Human-readable progress message.')


class ModelLoadCompletedResponse(BaseModel):
	"""Response model for when a model has been successfully loaded."""

	model_id: str = Field(..., description='The ID of the model that was loaded.')


class ModelLoadFailed(BaseModel):
	"""Response model for when a model has failed to load."""

	model_id: str = Field(..., description='The ID of the model that failed to load.')
	error: str = Field(..., description='The error message.')


class SingleFileStrategy(BaseModel):
	"""Strategy for loading models from a single checkpoint file."""

	checkpoint_path: str
	type: Literal['single_file'] = 'single_file'


class PretrainedStrategy(BaseModel):
	"""Strategy for loading pretrained models from HuggingFace Hub."""

	use_safetensors: bool
	variant: Optional[str] = None
	type: Literal['pretrained'] = 'pretrained'


Strategy = Union[SingleFileStrategy, PretrainedStrategy]


class VAEConfig(Protocol):
	"""Protocol for VAE configuration."""

	scaling_factor: float


class DecoderOutput(Protocol):
	"""Protocol for VAE decoder output."""

	sample: torch.Tensor


class VAE(Protocol):
	"""Protocol for VAE model."""

	config: VAEConfig

	def decode(self, latents: torch.Tensor, return_dict: bool = True, **kwargs) -> DecoderOutput: ...


class ImageProcessor(Protocol):
	"""Protocol for image processor."""

	def postprocess(
		self,
		images: torch.Tensor,
		output_type: str = 'pil',
		do_denormalize: Optional[list[bool]] = None,
		**kwargs,
	) -> list[Image.Image]: ...


class SchedulerConfig(Protocol):
	"""Protocol for scheduler configuration."""

	def __getattr__(self, name: str): ...


class Scheduler(Protocol):
	"""Protocol for scheduler."""

	config: SchedulerConfig

	@classmethod
	def from_config(cls, config: 'SchedulerConfig', **kwargs) -> 'Scheduler': ...


class UNetConfig(Protocol):
	"""Protocol for UNet configuration."""

	sample_size: int


class UNet(Protocol):
	"""Protocol for UNet model."""

	config: UNetConfig


class DiffusersPipelineProtocol(Protocol):
	"""Protocol defining common interface for all diffusers pipelines."""

	device: torch.device
	dtype: torch.dtype
	config: Mapping[str, object]
	vae: VAE
	image_processor: ImageProcessor
	scheduler: Scheduler
	unet: UNet

	def to(self, device: Optional[Union[str, torch.device]] = None) -> 'DiffusersPipelineProtocol': ...
	def to_empty(self, device: Optional[Union[str, torch.device]] = None) -> 'DiffusersPipelineProtocol': ...
	def __call__(self, **kwargs): ...
	def load_lora_weights(self, pretrained_model_name_or_path_or_dict: str, **kwargs) -> None: ...
	def set_adapters(self, adapter_names: list[str], adapter_weights: Optional[list[float]] = None) -> None: ...
	def unload_lora_weights(self) -> None: ...


# Type alias for diffusers pipelines - includes both auto pipelines and specific implementations
DiffusersPipeline: TypeAlias = (
	AutoPipelineForText2Image
	| AutoPipelineForImage2Image
	| StableDiffusionXLPipeline
	| StableDiffusionPipeline
	| StableDiffusion3Pipeline
)

# Type alias for pipeline classes that support from_single_file
SingleFilePipelineClass: TypeAlias = (
	type[StableDiffusionXLPipeline] | type[StableDiffusionPipeline] | type[StableDiffusion3Pipeline]
)
