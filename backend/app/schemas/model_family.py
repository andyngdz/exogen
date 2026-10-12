from enum import Enum


class ModelFamily(str, Enum):
	SD15 = 'sd15'
	SDXL = 'sdxl'
	SD2 = 'sd2'
	SD3 = 'sd3'
	FLUX = 'flux'
	UNKNOWN = 'unknown'
