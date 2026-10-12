"""Type stubs for realesrgan library."""

import numpy as np
from numpy.typing import NDArray

class RealESRGANer:
	"""Real-ESRGAN upscaler class."""

	scale: int

	def __init__(
		self,
		scale: int,
		model_path: str,
		model: object,
		tile: int = 0,
		tile_pad: int = 10,
		pre_pad: int = 10,
		half: bool = False,
		device: object = None,
		gpu_id: int = 0,
	) -> None: ...
	def enhance(
		self,
		img: NDArray[np.uint8],
		outscale: float = 4,
	) -> tuple[NDArray[np.uint8], None]: ...
