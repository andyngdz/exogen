"""Tests for platform optimizer base class."""

import pytest


class TestPlatformOptimizer:
	"""Test PlatformOptimizer abstract base class."""

	def test_cannot_instantiate_abstract_class(self):
		"""Test that PlatformOptimizer cannot be instantiated directly."""
		from app.cores.platform_optimizations.base import PlatformOptimizer

		with pytest.raises(TypeError, match="Can't instantiate abstract class"):
			PlatformOptimizer()

	def test_subclass_must_implement_apply(self):
		"""Test that subclasses must implement apply method."""
		from app.cores.platform_optimizations.base import PlatformOptimizer

		class IncompleteOptimizer(PlatformOptimizer):
			def get_platform_name(self) -> str:
				return 'Test'

		with pytest.raises(TypeError, match="Can't instantiate abstract class"):
			IncompleteOptimizer()

	def test_subclass_must_implement_get_platform_name(self):
		"""Test that subclasses must implement get_platform_name method."""
		from app.cores.platform_optimizations.base import PlatformOptimizer

		class IncompleteOptimizer(PlatformOptimizer):
			def apply(self, pipe) -> None:
				pass

		with pytest.raises(TypeError, match="Can't instantiate abstract class"):
			IncompleteOptimizer()

	def test_subclass_with_all_methods_can_be_instantiated(self):
		"""Test that subclass implementing all methods can be instantiated."""
		from app.cores.platform_optimizations.base import PlatformOptimizer

		class CompleteOptimizer(PlatformOptimizer):
			def apply(self, pipe) -> None:
				pass

			def get_platform_name(self) -> str:
				return 'Test'

		optimizer = CompleteOptimizer()
		assert optimizer.get_platform_name() == 'Test'
