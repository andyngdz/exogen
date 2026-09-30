"""Model Recommendation Service"""

from typing import List

from sqlalchemy.orm import Session

from app.constants.recommendations import SECTION_CONFIGS
from app.cores.max_memory import MaxMemoryConfig
from app.schemas.recommendations import (
	DeviceCapabilities,
	ModelRecommendationResponse,
	ModelRecommendationSection,
	RecommendationSectionType,
)
from app.services import device_service, logger_service

logger = logger_service.get_logger(__name__, category='ModelLoad')


class ModelRecommendationService:
	"""Service for generating hardware-based model recommendations"""

	def __init__(self, db: Session):
		self.db = db
		self.memory_config = MaxMemoryConfig(db)

	def get_recommendations(self) -> ModelRecommendationResponse:
		"""Get model recommendations based on current hardware configuration"""

		logger.info('Generating model recommendations based on hardware capabilities')

		device_capabilities = self.get_device_capabilities()
		sections = self.build_recommendation_sections(device_capabilities)
		default_section = self.get_default_section(device_capabilities)
		default_selected_id = self.get_default_selected_id(sections, default_section)

		return ModelRecommendationResponse(
			sections=sections,
			default_section=default_section,
			default_selected_id=default_selected_id,
		)

	def get_device_capabilities(self) -> DeviceCapabilities:
		"""Extract device capabilities for recommendation logic"""

		return DeviceCapabilities(
			max_ram_gb=self.memory_config.max_ram,
			max_gpu_gb=self.memory_config.max_gpu,
			is_cuda=device_service.is_cuda,
			is_mps=device_service.is_mps,
			device_index=self.memory_config.device_index,
		)

	def build_recommendation_sections(self, capabilities: DeviceCapabilities) -> List[ModelRecommendationSection]:
		"""Build recommendation sections based on hardware capabilities"""

		sections = []

		# Build sections based on hardware capabilities
		for section_id, config in SECTION_CONFIGS.items():
			# Check if this section is applicable for current hardware
			if capabilities.max_gpu_gb >= config.min_gpu_gb:
				# Determine if this section should be recommended
				is_recommended = self.is_section_recommended(section_id, capabilities)

				# Create section with models from constants
				section = ModelRecommendationSection(
					id=section_id,
					name=config.name,
					description=config.description,
					is_recommended=is_recommended,
					models=config.models,
				)
				sections.append(section)

		logger.info(
			f'Generated {len(sections)} recommendation sections for device capabilities: max_gpu_gb={capabilities.max_gpu_gb}'
		)

		return sections

	def get_default_section(self, capabilities: DeviceCapabilities) -> RecommendationSectionType:
		"""Get the recommended section type based on hardware capabilities"""

		if capabilities.max_gpu_gb >= 8:
			return RecommendationSectionType.HIGH_PERFORMANCE
		elif capabilities.max_gpu_gb >= 4:
			return RecommendationSectionType.STANDARD
		else:
			return RecommendationSectionType.LIGHTWEIGHT

	def is_section_recommended(self, section_id: RecommendationSectionType, capabilities: DeviceCapabilities) -> bool:
		"""Determine if a section should be recommended based on hardware"""

		recommended_section = self.get_default_section(capabilities)
		return section_id == recommended_section

	def get_default_selected_id(
		self,
		sections: List[ModelRecommendationSection],
		default_section: RecommendationSectionType,
	) -> str:
		"""Get the default selected model from the recommended section"""

		# Find the recommended section (guaranteed to exist)
		recommended_section = next(s for s in sections if s.id == default_section)

		# Look for recommended model in the default section first
		for model in recommended_section.models:
			if model.is_recommended:
				return model.id

		# If no recommended model, take first model from default section
		return recommended_section.models[0].id
