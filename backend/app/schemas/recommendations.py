"""Model Recommendation Schemas"""

from enum import Enum
from typing import List

from pydantic import BaseModel


class RecommendationSectionType(str, Enum):
	"""Enum for recommendation section types"""

	HIGH_PERFORMANCE = 'high-performance'
	STANDARD = 'standard'
	LIGHTWEIGHT = 'lightweight'


class ModelRecommendationItem(BaseModel):
	"""Model for individual model recommendation item"""

	id: str
	name: str
	description: str
	memory_requirement_gb: int
	model_size: str
	tags: List[str]
	is_recommended: bool


class ModelRecommendationSection(BaseModel):
	"""Model for recommendation section containing multiple models"""

	id: str
	name: str
	description: str
	is_recommended: bool
	models: List[ModelRecommendationItem]


class ModelRecommendationResponse(BaseModel):
	"""Model for complete recommendation response"""

	sections: List[ModelRecommendationSection]
	default_section: RecommendationSectionType
	default_selected_id: str


class DeviceCapabilities(BaseModel):
	"""Model for device hardware capabilities"""

	max_ram_gb: float
	max_gpu_gb: float
	is_cuda: bool
	is_mps: bool
	device_index: int


class SectionConfig(BaseModel):
	"""Model for section configuration"""

	name: str
	description: str
	models: List[ModelRecommendationItem]
	min_gpu_gb: float
