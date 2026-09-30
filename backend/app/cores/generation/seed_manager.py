"""Seed management for reproducible image generation."""

import torch

from app.services import device_service, logger_service

logger = logger_service.get_logger(__name__, category='Generate')


class SeedManager:
	"""Manages seed generation and setting for reproducible image generation."""

	@property
	def get_random_seed(self) -> int:
		"""Generate a random seed for image generation."""
		return int(torch.randint(0, 2**32 - 1, (1,)).item())

	def get_seed(self, seed: int) -> int:
		"""Get or generate random seed for reproducibility.

		Args:
			seed: Seed value (-1 for auto-generation, or specific seed for reproducibility).

		Returns:
			The seed value used for generation.
		"""
		random_seed = None

		if seed != -1:
			random_seed = seed
			torch.manual_seed(seed)
			logger.info(f'Using random seed: {seed}')
		else:
			random_seed = self.get_random_seed
			torch.manual_seed(random_seed)
			logger.info(f'Using auto-generated random seed: {random_seed}')

		if device_service.is_available:
			if device_service.is_cuda:
				torch.cuda.manual_seed(random_seed)
			elif device_service.is_mps:
				torch.mps.manual_seed(random_seed)

		return random_seed


seed_manager = SeedManager()
