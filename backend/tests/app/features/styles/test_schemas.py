"""Tests for app/features/styles/schemas.py

Covers:
- StyleSectionResponse schema validation
- Serialization and deserialization
- Default values handling
"""

from __future__ import annotations

import json

import pytest
from pydantic import ValidationError

from app.schemas.styles import StyleItem, StyleSectionResponse


class TestStyleSectionResponse:
	"""Test StyleSectionResponse schema."""

	def setup_method(self):
		"""Setup test method."""
		self.valid_style_item = StyleItem(id='test_style', name='Test Style', origin='Test', image='styles/test/style.jpg')

		self.valid_data = {
			'id': 'test_section',
			'name': 'Test Section',
			'styles': [{'id': 'test_style', 'name': 'Test Style', 'origin': 'Test', 'image': 'styles/test/style.jpg'}],
		}

	def test_valid_initialization(self):
		"""Test that StyleSectionResponse can be initialized with valid data."""
		# Arrange & Act
		response = StyleSectionResponse(id='test_section', name='Test Section', styles=[self.valid_style_item])

		# Assert
		assert response.id == 'test_section'
		assert len(response.styles) == 1
		assert response.styles[0].id == 'test_style'
		assert response.styles[0].name == 'Test Style'

	def test_missing_required_fields(self):
		"""Test that StyleSectionResponse raises error when required fields are missing."""
		# Act & Assert - Pass only styles (missing required 'id' and 'name')
		with pytest.raises(ValidationError) as exc_info:
			StyleSectionResponse(styles=[])

		# Verify the error message mentions the missing field
		assert 'id' in str(exc_info.value)

	def test_empty_styles_list(self):
		"""Test that StyleSectionResponse accepts empty styles list."""
		# Arrange & Act
		response = StyleSectionResponse(id='test_section', name='Test Section')

		# Assert
		assert response.id == 'test_section'
		assert response.name == 'Test Section'
		assert response.styles == []

	def test_serialization(self):
		"""Test that StyleSectionResponse can be serialized to JSON."""
		# Arrange
		response = StyleSectionResponse(id='test_section', name='Test Section', styles=[self.valid_style_item])

		# Act
		serialized = response.model_dump_json()
		deserialized = json.loads(serialized)

		# Assert
		assert deserialized['id'] == 'test_section'
		assert deserialized['name'] == 'Test Section'
		assert len(deserialized['styles']) == 1
		assert deserialized['styles'][0]['id'] == 'test_style'
		assert deserialized['styles'][0]['name'] == 'Test Style'

	def test_deserialization(self):
		"""Test that StyleSectionResponse can be deserialized from JSON."""
		# Arrange & Act
		response = StyleSectionResponse.model_validate(self.valid_data)

		# Assert
		assert response.id == 'test_section'
		assert response.name == 'Test Section'
		assert len(response.styles) == 1
		assert response.styles[0].id == 'test_style'
		assert response.styles[0].name == 'Test Style'

	def test_field_descriptions(self):
		"""Test that field descriptions are correctly set."""
		# Arrange
		schema = StyleSectionResponse.model_json_schema()

		# Assert
		assert schema['properties']['id']['description'] == 'Unique identifier for the styles response'
		assert schema['properties']['name']['description'] == 'Display name for the styles section'
		assert schema['properties']['styles']['description'] == 'List of style'
