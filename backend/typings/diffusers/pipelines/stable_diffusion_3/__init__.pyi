"""Type stubs for diffusers SD3 pipelines."""

from collections.abc import Mapping
from typing import Optional, Union

import torch
from transformers import CLIPImageProcessor

from ... import VAE, ImageProcessor, Scheduler, StableDiffusionSafetyChecker, UNet

class StableDiffusion3Pipeline:
	"""Stable Diffusion 3 pipeline."""

	scheduler: Scheduler
	unet: UNet
	vae: VAE
	image_processor: ImageProcessor
	device: torch.device
	dtype: torch.dtype
	config: Mapping[str, object]
	safety_checker: Optional[StableDiffusionSafetyChecker]
	feature_extractor: Optional[CLIPImageProcessor]

	@classmethod
	def from_single_file(cls, pretrained_model_link_or_path: str, **kwargs) -> 'StableDiffusion3Pipeline': ...
	def __call__(self, **kwargs): ...
	def load_lora_weights(self, pretrained_model_name_or_path_or_dict: str, **kwargs) -> None: ...
	def set_adapters(self, adapter_names: list[str], adapter_weights: Optional[list[float]] = None) -> None: ...
	def unload_lora_weights(self) -> None: ...
	def reset_device_map(self) -> None: ...
	def to(
		self,
		device: Optional[Union[str, torch.device]] = None,
		dtype: Optional[torch.dtype] = None,
	) -> 'StableDiffusion3Pipeline': ...
	def to_empty(
		self,
		device: Optional[Union[str, torch.device]] = None,
	) -> 'StableDiffusion3Pipeline': ...
