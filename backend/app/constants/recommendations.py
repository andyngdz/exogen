"""Model Recommendation Constants"""

from typing import Dict

from app.schemas.recommendations import ModelRecommendationItem, RecommendationSectionType, SectionConfig

# High Performance Models
HIGH_PERFORMANCE_MODELS = [
	ModelRecommendationItem(
		id='RunDiffusion/Juggernaut-XL-v9',
		name='Juggernaut XL',
		description='Premium XL model with exceptional quality and detail',
		memory_requirement_gb=8,
		model_size='6.5 GB',
		tags=['xl', 'high-quality', 'photorealistic'],
		is_recommended=True,
	),
]

# Standard Models
STANDARD_MODELS = [
	ModelRecommendationItem(
		id='stable-diffusion-v1-5/stable-diffusion-v1-5',
		name='Stable Diffusion 1.5',
		description='Reliable and widely-used image generation model',
		memory_requirement_gb=4,
		model_size='4.3 GB',
		tags=['stable', 'reliable', 'popular'],
		is_recommended=True,
	),
]

# Lightweight Models
LIGHTWEIGHT_MODELS = [
	ModelRecommendationItem(
		id='segmind/small-sd',
		name='Small Stable Diffusion',
		description='Compact model for quick generation',
		memory_requirement_gb=2,
		model_size='1.8 GB',
		tags=['compact', 'fast', 'efficient'],
		is_recommended=True,
	),
]

# Section Configurations
SECTION_CONFIGS: Dict[RecommendationSectionType, SectionConfig] = {
	RecommendationSectionType.HIGH_PERFORMANCE: SectionConfig(
		name='High Performance',
		description='Advanced models for powerful hardware',
		models=HIGH_PERFORMANCE_MODELS,
		min_gpu_gb=8,
	),
	RecommendationSectionType.STANDARD: SectionConfig(
		name='Standard',
		description='Balanced performance and quality models',
		models=STANDARD_MODELS,
		min_gpu_gb=4,
	),
	RecommendationSectionType.LIGHTWEIGHT: SectionConfig(
		name='Lightweight',
		description='Optimized models for efficient generation',
		models=LIGHTWEIGHT_MODELS,
		min_gpu_gb=0,
	),
}
