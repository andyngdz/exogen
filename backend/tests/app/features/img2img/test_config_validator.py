"""Tests for img2img config_validator module."""

from unittest.mock import Mock, patch

import pytest

from app.schemas.img2img import Img2ImgConfig


@pytest.fixture
def sample_config():
	"""Create a sample img2img config."""
	return Img2ImgConfig(
		init_image='data:image/png;base64,iVBORw0KGgo=',
		prompt='test prompt',
		width=512,
		height=512,
		number_of_images=1,
		steps=20,
	)


class TestValidateConfig:
	"""Test validate_config() method."""

	@patch('app.features.img2img.config_validator.memory_manager')
	def test_validates_batch_size_successfully(self, mock_memory_manager, sample_config):
		"""Test validation passes with valid config."""
		from app.features.img2img.config_validator import Img2ImgConfigValidator

		mock_memory_manager.validate_batch_size = Mock()
		validator = Img2ImgConfigValidator()

		validator.validate_config(sample_config)

		mock_memory_manager.validate_batch_size.assert_called_once_with(
			sample_config.number_of_images,
			sample_config.width,
			sample_config.height,
		)

	@patch('app.features.img2img.config_validator.memory_manager')
	def test_calls_memory_manager_with_correct_params(self, mock_memory_manager, sample_config):
		"""Test that memory manager is called with correct batch parameters."""
		from app.features.img2img.config_validator import Img2ImgConfigValidator

		mock_memory_manager.validate_batch_size = Mock()
		validator = Img2ImgConfigValidator()

		sample_config.number_of_images = 4
		sample_config.width = 1024
		sample_config.height = 768

		validator.validate_config(sample_config)

		mock_memory_manager.validate_batch_size.assert_called_once_with(4, 1024, 768)


class TestConfigValidatorSingleton:
	"""Test config_validator singleton."""

	def test_singleton_exists(self):
		"""Test that config_validator singleton instance exists."""
		from app.features.img2img.config_validator import config_validator

		assert config_validator is not None

	def test_singleton_has_validate_config_method(self):
		"""Test that singleton has validate_config method."""
		from app.features.img2img.config_validator import config_validator

		assert hasattr(config_validator, 'validate_config')
		assert callable(config_validator.validate_config)
