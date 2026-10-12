"""Type stubs for diffusers library.

This module provides type hints for the diffusers library APIs used in this project.
"""

from collections.abc import Mapping
from typing import Optional, Union

import numpy as np
import torch
from numpy.typing import NDArray
from PIL import Image
from transformers import CLIPImageProcessor

class SchedulerConfig:
	"""Scheduler configuration."""

	def __getattr__(self, name: str): ...

class UNetConfig:
	"""UNet configuration."""

	sample_size: int
	def __getattr__(self, name: str): ...

class Scheduler:
	"""Base scheduler class."""

	config: SchedulerConfig
	@classmethod
	def from_config(cls, config: SchedulerConfig, **kwargs) -> 'Scheduler': ...

class UNet:
	"""UNet model."""

	config: UNetConfig

class VAEConfig:
	"""VAE configuration."""

	scaling_factor: float
	def __getattr__(self, name: str): ...

class DecoderOutput:
	"""Output of VAE decoding."""

	sample: torch.Tensor

class VAE:
	"""VAE model for encoding/decoding images."""

	config: VAEConfig
	def decode(self, latents: torch.Tensor, return_dict: bool = True, **kwargs) -> DecoderOutput: ...
	def encode(self, images: torch.Tensor, return_dict: bool = True, **kwargs): ...

class ImageProcessor:
	"""Image processor for post-processing."""

	def postprocess(
		self,
		images: torch.Tensor,
		output_type: str = 'pil',
		do_denormalize: Optional[list[bool]] = None,
		**kwargs,
	) -> list[Image.Image]:
		"""Post-process tensor images to PIL Images.

		When output_type='pil' (default), returns list of PIL Images.
		"""
		...

class StableDiffusionSafetyChecker:
	"""Safety checker for detecting NSFW content."""

	def __call__(
		self,
		images: NDArray[np.uint8],
		clip_input: torch.Tensor,
	) -> tuple[NDArray[np.uint8], list[bool]]: ...

class AutoPipelineForText2Image:
	"""Auto pipeline for text-to-image generation."""

	scheduler: Scheduler
	unet: UNet
	vae: VAE
	image_processor: ImageProcessor
	device: torch.device
	dtype: torch.dtype
	config: Mapping[str, object]
	safety_checker: Optional[StableDiffusionSafetyChecker]
	feature_extractor: Optional[CLIPImageProcessor]

	def __call__(self, **kwargs): ...
	def load_lora_weights(self, pretrained_model_name_or_path_or_dict: str, **kwargs) -> None: ...
	def set_adapters(self, adapter_names: list[str], adapter_weights: Optional[list[float]] = None) -> None: ...
	def unload_lora_weights(self) -> None: ...
	def reset_device_map(self) -> None: ...
	def to(
		self,
		device: Optional[Union[str, torch.device]] = None,
		dtype: Optional[torch.dtype] = None,
	) -> 'AutoPipelineForText2Image': ...
	def to_empty(
		self,
		device: Optional[Union[str, torch.device]] = None,
	) -> 'AutoPipelineForText2Image': ...
	@classmethod
	def from_pipe(cls, pipe, **kwargs) -> 'AutoPipelineForText2Image': ...
	@classmethod
	def from_pretrained(cls, pretrained_model_name_or_path: str, **kwargs) -> 'AutoPipelineForText2Image': ...

class AutoPipelineForImage2Image:
	"""Auto pipeline for image-to-image generation."""

	scheduler: Scheduler
	unet: UNet
	vae: VAE
	image_processor: ImageProcessor
	device: torch.device
	dtype: torch.dtype
	config: Mapping[str, object]
	safety_checker: Optional[StableDiffusionSafetyChecker]
	feature_extractor: Optional[CLIPImageProcessor]

	def __call__(self, **kwargs): ...
	def load_lora_weights(self, pretrained_model_name_or_path_or_dict: str, **kwargs) -> None: ...
	def set_adapters(self, adapter_names: list[str], adapter_weights: Optional[list[float]] = None) -> None: ...
	def unload_lora_weights(self) -> None: ...
	def reset_device_map(self) -> None: ...
	def to(
		self,
		device: Optional[Union[str, torch.device]] = None,
		dtype: Optional[torch.dtype] = None,
	) -> 'AutoPipelineForImage2Image': ...
	def to_empty(
		self,
		device: Optional[Union[str, torch.device]] = None,
	) -> 'AutoPipelineForImage2Image': ...
	@classmethod
	def from_pipe(cls, pipe: AutoPipelineForText2Image, **kwargs) -> 'AutoPipelineForImage2Image': ...
	@classmethod
	def from_pretrained(cls, pretrained_model_name_or_path: str, **kwargs) -> 'AutoPipelineForImage2Image': ...

# Scheduler classes
class DDIMScheduler: ...
class DDPMScheduler: ...
class DEISMultistepScheduler: ...
class DPMSolverMultistepScheduler: ...
class DPMSolverSDEScheduler: ...
class DPMSolverSinglestepScheduler: ...
class EulerAncestralDiscreteScheduler: ...
class EulerDiscreteScheduler: ...
class HeunDiscreteScheduler: ...
class KDPM2AncestralDiscreteScheduler: ...
class KDPM2DiscreteScheduler: ...
class LCMScheduler: ...
class LMSDiscreteScheduler: ...
class PNDMScheduler: ...
class TCDScheduler: ...
class UniPCMultistepScheduler: ...
