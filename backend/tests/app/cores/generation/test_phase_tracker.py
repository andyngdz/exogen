"""Tests for GenerationPhaseTracker."""

from unittest.mock import Mock, patch

import pytest

from app.cores.generation.phase_tracker import GenerationPhaseTracker
from app.schemas.socket import GenerationPhase, GenerationPhaseResponse


class TestGenerationPhaseTracker:
	"""Tests for GenerationPhaseTracker class."""

	@pytest.fixture
	def config_without_hires_fix(self) -> Mock:
		"""Create a mock config without hires fix."""
		config = Mock()
		config.hires_fix = None
		return config

	@pytest.fixture
	def config_with_hires_fix(self) -> Mock:
		"""Create a mock config with hires fix enabled."""
		config = Mock()
		config.hires_fix = Mock()
		return config

	def test_builds_phases_without_upscaling(self, config_without_hires_fix: Mock) -> None:
		"""Test that phases only include IMAGE_GENERATION when hires_fix is disabled."""
		tracker = GenerationPhaseTracker(config_without_hires_fix)

		assert tracker.phases == [GenerationPhase.IMAGE_GENERATION]

	def test_builds_phases_with_upscaling(self, config_with_hires_fix: Mock) -> None:
		"""Test that phases include IMAGE_GENERATION and UPSCALING when hires_fix is enabled."""
		tracker = GenerationPhaseTracker(config_with_hires_fix)

		assert tracker.phases == [GenerationPhase.IMAGE_GENERATION, GenerationPhase.UPSCALING]

	@patch('app.cores.generation.phase_tracker.socket_service')
	def test_start_emits_image_generation_phase(self, mock_socket_service: Mock, config_without_hires_fix: Mock) -> None:
		"""Test that start() emits image_generation phase."""
		tracker = GenerationPhaseTracker(config_without_hires_fix)

		tracker.start()

		mock_socket_service.generation_phase.assert_called_once()
		call_args = mock_socket_service.generation_phase.call_args[0][0]
		assert isinstance(call_args, GenerationPhaseResponse)
		assert call_args.current == GenerationPhase.IMAGE_GENERATION
		assert call_args.phases == [GenerationPhase.IMAGE_GENERATION]

	@patch('app.cores.generation.phase_tracker.socket_service')
	def test_upscaling_emits_upscaling_phase(self, mock_socket_service: Mock, config_with_hires_fix: Mock) -> None:
		"""Test that upscaling() emits upscaling phase."""
		tracker = GenerationPhaseTracker(config_with_hires_fix)

		tracker.upscaling()

		mock_socket_service.generation_phase.assert_called_once()
		call_args = mock_socket_service.generation_phase.call_args[0][0]
		assert isinstance(call_args, GenerationPhaseResponse)
		assert call_args.current == GenerationPhase.UPSCALING
		assert call_args.phases == [GenerationPhase.IMAGE_GENERATION, GenerationPhase.UPSCALING]

	@patch('app.cores.generation.phase_tracker.socket_service')
	def test_complete_emits_completed_phase(self, mock_socket_service: Mock, config_without_hires_fix: Mock) -> None:
		"""Test that complete() emits completed phase."""
		tracker = GenerationPhaseTracker(config_without_hires_fix)

		tracker.complete()

		mock_socket_service.generation_phase.assert_called_once()
		call_args = mock_socket_service.generation_phase.call_args[0][0]
		assert isinstance(call_args, GenerationPhaseResponse)
		assert call_args.current == GenerationPhase.COMPLETED
		assert call_args.phases == [GenerationPhase.IMAGE_GENERATION]

	@patch('app.cores.generation.phase_tracker.socket_service')
	def test_full_flow_without_upscaling(self, mock_socket_service: Mock, config_without_hires_fix: Mock) -> None:
		"""Test full flow without upscaling: start -> complete."""
		tracker = GenerationPhaseTracker(config_without_hires_fix)

		tracker.start()
		tracker.complete()

		assert mock_socket_service.generation_phase.call_count == 2
		calls = mock_socket_service.generation_phase.call_args_list

		first_call = calls[0][0][0]
		assert first_call.current == GenerationPhase.IMAGE_GENERATION

		second_call = calls[1][0][0]
		assert second_call.current == GenerationPhase.COMPLETED

	@patch('app.cores.generation.phase_tracker.socket_service')
	def test_full_flow_with_upscaling(self, mock_socket_service: Mock, config_with_hires_fix: Mock) -> None:
		"""Test full flow with upscaling: start -> upscaling -> complete."""
		tracker = GenerationPhaseTracker(config_with_hires_fix)

		tracker.start()
		tracker.upscaling()
		tracker.complete()

		assert mock_socket_service.generation_phase.call_count == 3
		calls = mock_socket_service.generation_phase.call_args_list

		first_call = calls[0][0][0]
		assert first_call.current == GenerationPhase.IMAGE_GENERATION

		second_call = calls[1][0][0]
		assert second_call.current == GenerationPhase.UPSCALING

		third_call = calls[2][0][0]
		assert third_call.current == GenerationPhase.COMPLETED
