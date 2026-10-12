"""Unit tests for app/schemas/socket.py

Covers validation rules for socket-related Pydantic models and enums:
- GenerationPhase enum behavior
- GenerationPhaseResponse validation and serialization
- SocketEvents enum values
"""

import pytest
from pydantic import ValidationError

from app.schemas.socket import GenerationPhase, GenerationPhaseResponse, SocketEvents


class TestGenerationPhase:
	def test_enum_values_are_strings(self) -> None:
		assert GenerationPhase.IMAGE_GENERATION == 'image_generation'
		assert GenerationPhase.UPSCALING == 'upscaling'
		assert GenerationPhase.COMPLETED == 'completed'

	def test_enum_serializes_to_string_value(self) -> None:
		assert GenerationPhase.IMAGE_GENERATION.value == 'image_generation'
		assert GenerationPhase.UPSCALING.value == 'upscaling'
		assert GenerationPhase.COMPLETED.value == 'completed'


class TestGenerationPhaseResponse:
	def test_requires_phases_and_current(self) -> None:
		with pytest.raises(ValidationError):
			GenerationPhaseResponse()  # type: ignore[call-arg]

	def test_requires_phases(self) -> None:
		with pytest.raises(ValidationError):
			GenerationPhaseResponse(current=GenerationPhase.IMAGE_GENERATION)  # type: ignore[call-arg]

	def test_requires_current(self) -> None:
		with pytest.raises(ValidationError):
			GenerationPhaseResponse(phases=[GenerationPhase.IMAGE_GENERATION])  # type: ignore[call-arg]

	def test_accepts_valid_data_without_upscaling(self) -> None:
		response = GenerationPhaseResponse(
			phases=[GenerationPhase.IMAGE_GENERATION],
			current=GenerationPhase.IMAGE_GENERATION,
		)
		assert response.phases == [GenerationPhase.IMAGE_GENERATION]
		assert response.current == GenerationPhase.IMAGE_GENERATION

	def test_accepts_valid_data_with_upscaling(self) -> None:
		response = GenerationPhaseResponse(
			phases=[GenerationPhase.IMAGE_GENERATION, GenerationPhase.UPSCALING],
			current=GenerationPhase.UPSCALING,
		)
		assert response.phases == [GenerationPhase.IMAGE_GENERATION, GenerationPhase.UPSCALING]
		assert response.current == GenerationPhase.UPSCALING

	def test_accepts_completed_as_current(self) -> None:
		response = GenerationPhaseResponse(
			phases=[GenerationPhase.IMAGE_GENERATION],
			current=GenerationPhase.COMPLETED,
		)
		assert response.current == GenerationPhase.COMPLETED

	def test_serializes_phases_as_strings(self) -> None:
		response = GenerationPhaseResponse(
			phases=[GenerationPhase.IMAGE_GENERATION, GenerationPhase.UPSCALING],
			current=GenerationPhase.IMAGE_GENERATION,
		)
		payload = response.model_dump()
		assert payload['phases'] == ['image_generation', 'upscaling']
		assert payload['current'] == 'image_generation'

	def test_serializes_completed_phase(self) -> None:
		response = GenerationPhaseResponse(
			phases=[GenerationPhase.IMAGE_GENERATION],
			current=GenerationPhase.COMPLETED,
		)
		payload = response.model_dump()
		assert payload['current'] == 'completed'


class TestSocketEvents:
	def test_generation_phase_event_exists(self) -> None:
		assert SocketEvents.GENERATION_PHASE == 'generation_phase'

	def test_all_events_are_strings(self) -> None:
		for event in SocketEvents:
			assert isinstance(event.value, str)
