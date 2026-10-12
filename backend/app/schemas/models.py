"""Model Info"""

from typing import Any, Dict, Optional

from pydantic import BaseModel, Field

from app.schemas.model_family import ModelFamily


class ModelSearchInfo(BaseModel):
	"""
	Represents a Stable Diffusion model, either local or from Hugging Face Hub.
	"""

	id: str = Field(..., description='Hugging Face repo ID')
	author: Optional[str] = Field(None, description='Author or org')
	likes: Optional[int] = Field(None, description='Number of likes')
	trending_score: Optional[float] = Field(None, description='Trending score')
	downloads: int = Field(default=0, description='Downloads count')
	tags: list[str] = Field(default_factory=list, description='Tags')
	is_downloaded: bool = Field(default=False, description='Downloaded locally?')
	size_mb: Optional[float] = Field(None, description='Estimated model size (MB)')
	description: Optional[str] = Field(None, description='Model description')


class ModelSearchInfoListResponse(BaseModel):
	"""
	Response model for listing Stable Diffusion models.
	"""

	models_search_info: list[ModelSearchInfo] = Field(
		default_factory=list,
		description='List of Stable Diffusion models when searching.',
	)


class LoadModelResponse(BaseModel):
	"""
	Response model for loading a Stable Diffusion model.
	"""

	model_id: str = Field(
		...,
		description='Unique identifier for the model (Hugging Face repo ID).',
	)
	config: Optional[Dict[str, Any]] = Field(
		default_factory=lambda: {},
		description='Model configuration details.',
	)
	sample_size: int = Field(
		default=64,
		description='Sample size of the model.',
	)
	family: ModelFamily = Field(default=ModelFamily.UNKNOWN, description='Authoritative family for the loaded model.')


class NewModelAvailableResponse(BaseModel):
	"""
	Response model for notifying about a new model available.
	"""

	model_id: str = Field(
		...,
		description='Unique identifier for the new model (Hugging Face repo ID).',
	)


class ModelAvailableResponse(BaseModel):
	"""
	Response model for checking if a model is available.
	"""

	model_id: str = Field(
		...,
		description='Unique identifier for the model (Hugging Face repo ID).',
	)
	is_downloaded: bool = Field(default=False, description='Is the model downloaded locally?')


class LoadModelRequest(BaseModel):
	"""Request model for loading a model by ID."""

	model_id: str = Field(..., description='The ID of the model to load.')
