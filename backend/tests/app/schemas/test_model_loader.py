"""Unit tests for app/schemas/model_loader.py

Covers validation rules for Pydantic models and enums:
- ModelLoadPhase enum behavior
- Required vs optional fields
- Field validation and constraints
- Strategy discriminated unions
- Serialization with model_dump()
"""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.schemas.model_loader import (
	ModelLoadCompletedResponse,
	ModelLoadFailed,
	ModelLoadPhase,
	ModelLoadProgressResponse,
	PretrainedStrategy,
	SingleFileStrategy,
)


class TestModelLoadPhase:
	def test_enum_values_are_strings(self) -> None:
		assert ModelLoadPhase.INITIALIZATION == 'initialization'
		assert ModelLoadPhase.LOADING_MODEL == 'loading_model'
		assert ModelLoadPhase.DEVICE_SETUP == 'device_setup'
		assert ModelLoadPhase.OPTIMIZATION == 'optimization'

	def test_enum_serializes_to_string(self) -> None:
		assert str(ModelLoadPhase.INITIALIZATION) == 'ModelLoadPhase.INITIALIZATION'
		assert ModelLoadPhase.INITIALIZATION.value == 'initialization'


class TestModelLoadProgressResponse:
	def test_requires_all_fields(self) -> None:
		with pytest.raises(ValidationError):
			ModelLoadProgressResponse()  # type: ignore[call-arg]

	def test_accepts_valid_data(self) -> None:
		response = ModelLoadProgressResponse(
			model_id='org/model',
			step=3,
			phase=ModelLoadPhase.LOADING_MODEL,
			message='Loading weights...',
		)
		assert response.model_id == 'org/model'
		assert response.step == 3
		assert response.total == 8
		assert response.phase == ModelLoadPhase.LOADING_MODEL
		assert response.message == 'Loading weights...'

	def test_default_total_is_eight(self) -> None:
		response = ModelLoadProgressResponse(
			model_id='org/model',
			step=1,
			phase=ModelLoadPhase.INITIALIZATION,
			message='Starting...',
		)
		assert response.total == 8

	def test_total_can_be_overridden(self) -> None:
		response = ModelLoadProgressResponse(
			model_id='org/model',
			step=1,
			total=5,
			phase=ModelLoadPhase.INITIALIZATION,
			message='Starting...',
		)
		assert response.total == 5

	def test_serializes_phase_as_string(self) -> None:
		response = ModelLoadProgressResponse(
			model_id='org/model',
			step=1,
			phase=ModelLoadPhase.INITIALIZATION,
			message='Starting...',
		)
		payload = response.model_dump()
		assert payload['phase'] == 'initialization'


class TestModelLoadCompletedResponse:
	def test_requires_model_id(self) -> None:
		with pytest.raises(ValidationError):
			ModelLoadCompletedResponse()  # type: ignore[call-arg]

	def test_accepts_model_id(self) -> None:
		response = ModelLoadCompletedResponse(model_id='org/model')
		assert response.model_id == 'org/model'

	def test_serializes_correctly(self) -> None:
		response = ModelLoadCompletedResponse(model_id='org/model')
		payload = response.model_dump()
		assert payload == {'model_id': 'org/model'}


class TestModelLoadFailed:
	def test_requires_both_fields(self) -> None:
		with pytest.raises(ValidationError):
			ModelLoadFailed(model_id='org/model')  # type: ignore[call-arg]
		with pytest.raises(ValidationError):
			ModelLoadFailed(error='Something went wrong')  # type: ignore[call-arg]

	def test_accepts_valid_data(self) -> None:
		response = ModelLoadFailed(model_id='org/model', error='Failed to load model')
		assert response.model_id == 'org/model'
		assert response.error == 'Failed to load model'

	def test_serializes_correctly(self) -> None:
		response = ModelLoadFailed(model_id='org/model', error='Error message')
		payload = response.model_dump()
		assert payload == {'model_id': 'org/model', 'error': 'Error message'}


class TestSingleFileStrategy:
	def test_requires_checkpoint_path(self) -> None:
		with pytest.raises(ValidationError):
			SingleFileStrategy()  # type: ignore[call-arg]

	def test_accepts_checkpoint_path(self) -> None:
		strategy = SingleFileStrategy(checkpoint_path='/path/to/model.safetensors')
		assert strategy.checkpoint_path == '/path/to/model.safetensors'
		assert strategy.type == 'single_file'

	def test_type_is_literal_single_file(self) -> None:
		strategy = SingleFileStrategy(checkpoint_path='/path/to/model.safetensors')
		assert strategy.type == 'single_file'

	def test_type_cannot_be_changed(self) -> None:
		with pytest.raises(ValidationError):
			SingleFileStrategy(checkpoint_path='/path', type='other')  # type: ignore[arg-type]

	def test_serializes_correctly(self) -> None:
		strategy = SingleFileStrategy(checkpoint_path='/path/to/model.safetensors')
		payload = strategy.model_dump()
		assert payload == {'checkpoint_path': '/path/to/model.safetensors', 'type': 'single_file'}


class TestPretrainedStrategy:
	def test_requires_use_safetensors(self) -> None:
		with pytest.raises(ValidationError):
			PretrainedStrategy()  # type: ignore[call-arg]

	def test_accepts_use_safetensors(self) -> None:
		strategy = PretrainedStrategy(use_safetensors=True)
		assert strategy.use_safetensors is True
		assert strategy.variant is None
		assert strategy.type == 'pretrained'

	def test_accepts_optional_variant(self) -> None:
		strategy = PretrainedStrategy(use_safetensors=True, variant='fp16')
		assert strategy.variant == 'fp16'

	def test_type_is_literal_pretrained(self) -> None:
		strategy = PretrainedStrategy(use_safetensors=False)
		assert strategy.type == 'pretrained'

	def test_type_cannot_be_changed(self) -> None:
		with pytest.raises(ValidationError):
			PretrainedStrategy(use_safetensors=True, type='other')  # type: ignore[arg-type]

	def test_serializes_correctly(self) -> None:
		strategy = PretrainedStrategy(use_safetensors=True, variant='fp16')
		payload = strategy.model_dump()
		assert payload == {'use_safetensors': True, 'variant': 'fp16', 'type': 'pretrained'}

	def test_serializes_without_variant(self) -> None:
		strategy = PretrainedStrategy(use_safetensors=False)
		payload = strategy.model_dump()
		assert payload == {'use_safetensors': False, 'variant': None, 'type': 'pretrained'}
