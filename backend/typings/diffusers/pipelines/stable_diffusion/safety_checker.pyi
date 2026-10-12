import numpy as np
import torch
from numpy.typing import NDArray
from torch import nn

class StableDiffusionSafetyChecker(nn.Module):
	def __call__(
		self,
		images: NDArray[np.uint8],
		clip_input: torch.Tensor,
	) -> tuple[NDArray[np.uint8], list[bool]]: ...
	@classmethod
	def from_pretrained(cls, pretrained_model_name_or_path: str, **kwargs) -> 'StableDiffusionSafetyChecker': ...
