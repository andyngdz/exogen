"""Tests for app/features/config/service.py

Covers:
- ConfigService.get_upscaler_sections returns grouped sections
"""

from app.features.config.service import ConfigService
from app.schemas.config import UpscalerItem, UpscalerSection, UpscalingMethod


class TestGetUpscalerSections:
	"""Test ConfigService.get_upscaler_sections functionality."""

	def setup_method(self):
		"""Setup test method."""
		self.service = ConfigService()

	def test_returns_upscaler_sections(self):
		"""Test that get_upscaler_sections returns UpscalerSection instances."""
		result = self.service.get_upscaler_sections()

		assert isinstance(result, list)
		assert all(isinstance(section, UpscalerSection) for section in result)

	def test_returns_two_sections(self):
		"""Test that get_upscaler_sections returns traditional and AI sections."""
		result = self.service.get_upscaler_sections()

		assert len(result) == 2
		methods = [section.method for section in result]
		assert UpscalingMethod.TRADITIONAL in methods
		assert UpscalingMethod.AI in methods

	def test_traditional_section_has_correct_title(self):
		"""Test that traditional section has 'Traditional' title."""
		result = self.service.get_upscaler_sections()
		traditional_section = next(s for s in result if s.method == UpscalingMethod.TRADITIONAL)

		assert traditional_section.title == 'Traditional'

	def test_ai_section_has_correct_title(self):
		"""Test that AI section has 'AI' title."""
		result = self.service.get_upscaler_sections()
		ai_section = next(s for s in result if s.method == UpscalingMethod.AI)

		assert ai_section.title == 'AI'

	def test_traditional_section_contains_traditional_upscalers(self):
		"""Test that traditional section contains only traditional upscalers."""
		result = self.service.get_upscaler_sections()
		traditional_section = next(s for s in result if s.method == UpscalingMethod.TRADITIONAL)
		traditional_values = ['Lanczos', 'Bicubic', 'Bilinear', 'Nearest']

		assert len(traditional_section.options) == 4
		for item in traditional_section.options:
			assert item.value in traditional_values
			assert item.method == UpscalingMethod.TRADITIONAL

	def test_ai_section_contains_ai_upscalers(self):
		"""Test that AI section contains only AI upscalers."""
		result = self.service.get_upscaler_sections()
		ai_section = next(s for s in result if s.method == UpscalingMethod.AI)
		ai_values = ['RealESRGAN_x2plus', 'RealESRGAN_x4plus', 'RealESRGAN_x4plus_anime']

		assert len(ai_section.options) == 3
		for item in ai_section.options:
			assert item.value in ai_values
			assert item.method == UpscalingMethod.AI

	def test_options_are_upscaler_items(self):
		"""Test that options in each section are UpscalerItem instances."""
		result = self.service.get_upscaler_sections()

		for section in result:
			assert all(isinstance(item, UpscalerItem) for item in section.options)

	def test_ai_upscalers_are_recommended(self):
		"""Test that AI upscalers are recommended and traditional are not."""
		result = self.service.get_upscaler_sections()

		for section in result:
			for item in section.options:
				if section.method == UpscalingMethod.AI:
					assert item.is_recommended is True
				else:
					assert item.is_recommended is False

	def test_denoise_strengths_in_valid_range(self):
		"""Test that all denoise strengths are between 0.0 and 1.0."""
		result = self.service.get_upscaler_sections()

		for section in result:
			for item in section.options:
				assert 0.0 <= item.suggested_denoise_strength <= 1.0
