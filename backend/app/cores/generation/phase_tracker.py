"""Generation phase tracking for frontend stepper UI."""

from app.schemas.generators import GeneratorConfig
from app.schemas.socket import GenerationPhase, GenerationPhaseResponse
from app.socket import socket_service


class BasePhaseTracker:
	"""Base class for phase tracking with common emit logic."""

	def __init__(self, phases: list[GenerationPhase]) -> None:
		"""Initialize tracker with list of phases.

		Args:
			phases: List of phases that will occur during generation
		"""
		self.phases = phases

	def _emit(self, current: GenerationPhase) -> None:
		"""Emit generation phase event.

		Args:
			current: Current active phase
		"""
		response = GenerationPhaseResponse(phases=self.phases, current=current)
		socket_service.generation_phase(response)

	def start(self) -> None:
		"""Emit image generation phase event."""
		self._emit(GenerationPhase.IMAGE_GENERATION)

	def complete(self) -> None:
		"""Emit completed phase event."""
		self._emit(GenerationPhase.COMPLETED)


class GenerationPhaseTracker(BasePhaseTracker):
	"""Tracks and emits generation phase events for text-to-image frontend stepper.

	This class centralizes phase management, determining available phases
	from the generation config and emitting events at each phase transition.
	"""

	def __init__(self, config: GeneratorConfig) -> None:
		"""Initialize tracker with generation config.

		Args:
			config: Generation configuration to determine available phases
		"""
		phases = self._build_phases(config)
		super().__init__(phases)

	def _build_phases(self, config: GeneratorConfig) -> list[GenerationPhase]:
		"""Build list of phases based on config.

		Args:
			config: Generation configuration

		Returns:
			List of phases that will occur during generation
		"""
		phases = [GenerationPhase.IMAGE_GENERATION]
		if config.hires_fix:
			phases.append(GenerationPhase.UPSCALING)
		return phases

	def upscaling(self) -> None:
		"""Emit upscaling phase event."""
		self._emit(GenerationPhase.UPSCALING)


class Img2ImgPhaseTracker(BasePhaseTracker):
	"""Tracks and emits generation phase events for img2img frontend stepper."""

	def __init__(self, has_hires_fix: bool) -> None:
		"""Initialize tracker with img2img phases."""
		phases = [GenerationPhase.IMAGE_GENERATION]
		if has_hires_fix:
			phases.append(GenerationPhase.UPSCALING)
		super().__init__(phases)

	def upscaling(self) -> None:
		"""Emit upscaling phase event."""
		self._emit(GenerationPhase.UPSCALING)
