"""Type stubs for gfpgan library."""

import numpy as np
from numpy.typing import NDArray

class GFPGANer:
	"""GFPGAN face enhancement class."""

	def __init__(
		self,
		model_path: str,
		upscale: float = 2,
		arch: str = 'clean',
		channel_multiplier: int = 2,
		bg_upsampler: object = None,
		device: object = None,
	) -> None: ...
	def enhance(
		self,
		img: NDArray[np.uint8],
		has_aligned: bool = False,
		only_center_face: bool = False,
		paste_back: bool = True,
		weight: float = 0.5,
	) -> tuple[NDArray[np.uint8], NDArray[np.uint8], NDArray[np.uint8]]: ...
