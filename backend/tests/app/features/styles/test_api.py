"""Tests for app/features/styles/api.py

Covers:
- Get styles endpoint functionality
- Get prompt styles endpoint functionality
- Proper response formatting
"""

from __future__ import annotations

import sys
from types import ModuleType
from unittest.mock import MagicMock, patch

from app.features.styles.api import get_prompt_styles, get_styles
from app.schemas.styles import StyleItem, StyleSectionResponse


def setup_module():
	"""Setup test module with necessary stubs."""
	# Stub transformers module to avoid importing the real package
	transformers_mod = ModuleType('transformers')
	sys.modules['transformers'] = transformers_mod

	class CLIPTokenizer:
		@classmethod
		def from_pretrained(cls, model_name):
			return cls()

		def __call__(self, text):
			# Simple mock that returns a token count proportional to text length
			return MagicMock(input_ids=list(range(min(len(text) // 4, 100))))

		def decode(self, input_ids, skip_special_tokens=True):
			# Return a string with length proportional to token count
			return 'A' * len(input_ids)

	setattr(transformers_mod, 'CLIPTokenizer', CLIPTokenizer)


class TestStylesEndpoints:
	"""Test styles API endpoints."""

	def setup_method(self):
		"""Setup test method."""
		# Create test style items
		self.test_fooocus_styles = [
			StyleItem(
				id='test_style1',
				name='Test Style 1',
				origin='Test',
				positive='{prompt}, detailed',
				negative='low quality',
				image='styles/test/style1.jpg',
			),
			StyleItem(
				id='test_style2',
				name='Test Style 2',
				origin='Test',
				positive='{prompt}, vibrant',
				image='styles/test/style2.jpg',
			),
		]

		self.test_sai_styles = [
			StyleItem(
				id='test_style3',
				name='Test Style 3',
				origin='Test',
				positive='{prompt}, sharp',
				negative='blurry',
				image='styles/test/style3.jpg',
			)
		]

	@patch('app.features.styles.api.all_styles', new_callable=dict)
	def test_get_styles_returns_correct_sections(self, mock_all_styles):
		"""Test that get_styles returns the correct style sections."""
		# Arrange
		mock_all_styles.clear()
		mock_all_styles.update({'fooocus': self.test_fooocus_styles, 'sai': self.test_sai_styles})

		# Act
		result = get_styles()

		# Assert
		assert len(result) == 2
		assert all(isinstance(section, StyleSectionResponse) for section in result)

		fooocus_section = next(section for section in result if section.id == 'fooocus')
		sai_section = next(section for section in result if section.id == 'sai')

		assert fooocus_section.id == 'fooocus'
		assert len(fooocus_section.styles) == 2
		assert fooocus_section.styles[0].id == 'test_style1'
		assert fooocus_section.styles[1].id == 'test_style2'

		assert sai_section.id == 'sai'
		assert len(sai_section.styles) == 1
		assert sai_section.styles[0].id == 'test_style3'

	@patch('app.features.styles.api.styles_service')
	def test_get_prompt_styles_calls_service_with_correct_params(self, mock_styles_service):
		"""Test that get_prompt_styles calls the service with correct parameters."""
		# Arrange
		test_prompt = 'a beautiful landscape'
		expected_styles = ['fooocus_v2', 'fooocus_enhance', 'fooocus_sharp']
		mock_styles_service.apply_styles.return_value = ['positive prompt', 'negative prompt']

		# Act
		result = get_prompt_styles(test_prompt)

		# Assert
		mock_styles_service.apply_styles.assert_called_once_with(test_prompt, '', expected_styles)
		assert result == ['positive prompt', 'negative prompt']

	@patch('app.features.styles.api.styles_service')
	def test_get_prompt_styles_returns_service_result(self, mock_styles_service):
		"""Test that get_prompt_styles returns the result from the service."""
		# Arrange
		mock_styles_service.apply_styles.return_value = ['enhanced prompt', 'negative terms']

		# Act
		result = get_prompt_styles('test prompt')

		# Assert
		assert result == ['enhanced prompt', 'negative terms']
