"""Type stubs for basicsr.archs.rrdbnet_arch module."""

import torch

class RRDBNet(torch.nn.Module):
	"""RRDB network architecture for Real-ESRGAN."""

	def __init__(
		self,
		num_in_ch: int,
		num_out_ch: int,
		num_feat: int = 64,
		num_block: int = 23,
		num_grow_ch: int = 32,
		scale: int = 4,
	) -> None: ...
