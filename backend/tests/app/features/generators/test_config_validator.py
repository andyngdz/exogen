"""Tests for config_validator module."""

from unittest.mock import Mock, patch

import pytest

from app.schemas.generators import GeneratorConfig


@pytest.fixture
def sample_config():
	"""Create a sample generator config."""
	return GeneratorConfig(
		prompt='test prompt',
		width=512,
		height=512,
		number_of_images=1,
		steps=20,
	)


class TestValidateConfig:
	"""Test validate_config() method."""

	@patch('app.features.generators.config_validator.memory_manager')
	def test_validates_batch_size_successfully(self, mock_memory_manager, sample_config):
		"""Test validation passes with valid config."""
		from app.features.generators.config_validator import ConfigValidator

		# Setup
		mock_memory_manager.validate_batch_size = Mock()
		validator = ConfigValidator()

		# Execute - should not raise
		validator.validate_config(sample_config)

		# Verify
		mock_memory_manager.validate_batch_size.assert_called_once_with(
			sample_config.number_of_images,
			sample_config.width,
			sample_config.height,
		)

	@patch('app.features.generators.config_validator.memory_manager')
	def test_calls_memory_manager_with_correct_params(self, mock_memory_manager, sample_config):
		"""Test that memory manager is called with correct batch parameters."""
		from app.features.generators.config_validator import ConfigValidator

		# Setup
		mock_memory_manager.validate_batch_size = Mock()
		validator = ConfigValidator()

		# Test with different batch sizes
		sample_config.number_of_images = 4
		sample_config.width = 1024
		sample_config.height = 768

		# Execute
		validator.validate_config(sample_config)

		# Verify correct parameters
		mock_memory_manager.validate_batch_size.assert_called_once_with(4, 1024, 768)


class TestConfigValidatorSingleton:
	"""Test config_validator singleton."""

	def test_singleton_exists(self):
		"""Test that config_validator singleton instance exists."""
		from app.features.generators.config_validator import config_validator

		assert config_validator is not None

	def test_singleton_has_validate_config_method(self):
		"""Test that singleton has validate_config method."""
		from app.features.generators.config_validator import config_validator

		assert hasattr(config_validator, 'validate_config')
		assert callable(config_validator.validate_config)
