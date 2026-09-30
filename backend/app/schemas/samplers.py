from typing import Optional

from pydantic import BaseModel, Field


class SamplerItem(BaseModel):
	"""Available sampler to send to the client."""

	name: str = Field(..., description='User-friendly name of the sampler.')
	value: str = Field(..., description='Internal enum value for the sampler.')
	description: Optional[str] = Field(None, description="Brief description of the sampler's characteristics.")
