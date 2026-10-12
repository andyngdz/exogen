"""Tests for img2img schemas."""

import pytest
from pydantic import ValidationError

from app.constants.img2img import IMG2IMG_DEFAULT_STRENGTH
from app.cores.samplers import SamplerType
from app.schemas.img2img import Img2ImgConfig, Img2ImgRequest


class TestImg2ImgConfig:
	def test_creates_valid_config_with_defaults(self):
		"""Test creating Img2ImgConfig with default values."""
		config = Img2ImgConfig(init_image='base64string', prompt='test prompt')

		assert config.init_image == 'base64string'
		assert config.prompt == 'test prompt'
		assert config.strength == pytest.approx(IMG2IMG_DEFAULT_STRENGTH)
		assert config.resize_mode == 'resize'
		assert config.width == 512
		assert config.height == 512
		assert config.number_of_images == 1
		assert config.steps == 24
		assert config.cfg_scale == pytest.approx(7.5)
		assert config.seed == -1
		assert config.sampler == SamplerType.EULER_A
		assert config.styles == []

	def test_creates_config_with_custom_values(self):
		"""Test creating Img2ImgConfig with custom values."""
		config = Img2ImgConfig(
			init_image='base64string',
			prompt='test prompt',
			strength=0.5,
			resize_mode='crop',
			width=1024,
			height=768,
			number_of_images=2,
			steps=50,
			cfg_scale=10.0,
			seed=42,
			sampler=SamplerType.DDIM,
			styles=['style1', 'style2'],
		)

		assert config.strength == pytest.approx(0.5)
		assert config.resize_mode == 'crop'
		assert config.width == 1024
		assert config.height == 768
		assert config.number_of_images == 2
		assert config.steps == 50
		assert config.cfg_scale == pytest.approx(10.0)
		assert config.seed == 42
		assert config.sampler == SamplerType.DDIM
		assert config.styles == ['style1', 'style2']

	def test_validates_strength_range(self):
		"""Test strength validation (0.0 to 1.0)."""
		# Valid strength
		config = Img2ImgConfig(init_image='base64', prompt='test', strength=0.0)
		assert config.strength == pytest.approx(0.0)

		config = Img2ImgConfig(init_image='base64', prompt='test', strength=1.0)
		assert config.strength == pytest.approx(1.0)

		# Invalid strength (too high)
		with pytest.raises(ValidationError):
			Img2ImgConfig(init_image='base64', prompt='test', strength=1.5)

		# Invalid strength (negative)
		with pytest.raises(ValidationError):
			Img2ImgConfig(init_image='base64', prompt='test', strength=-0.1)

	def test_requires_init_image(self):
		"""Test that init_image is required."""
		with pytest.raises(ValidationError) as exc_info:
			Img2ImgConfig(prompt='test prompt')

		assert 'init_image' in str(exc_info.value)

	def test_requires_prompt(self):
		"""Test that prompt is required."""
		with pytest.raises(ValidationError) as exc_info:
			Img2ImgConfig(init_image='base64string')

		assert 'prompt' in str(exc_info.value)

	def test_validates_width_minimum(self):
		"""Test width minimum validation."""
		with pytest.raises(ValidationError):
			Img2ImgConfig(init_image='base64', prompt='test', width=32)  # Below minimum 64

	def test_validates_height_minimum(self):
		"""Test height minimum validation."""
		with pytest.raises(ValidationError):
			Img2ImgConfig(init_image='base64', prompt='test', height=32)  # Below minimum 64

	def test_validates_number_of_images_minimum(self):
		"""Test number_of_images minimum validation."""
		with pytest.raises(ValidationError):
			Img2ImgConfig(init_image='base64', prompt='test', number_of_images=0)

	def test_validates_steps_minimum(self):
		"""Test steps minimum validation."""
		with pytest.raises(ValidationError):
			Img2ImgConfig(init_image='base64', prompt='test', steps=0)

	def test_validates_cfg_scale_minimum(self):
		"""Test cfg_scale minimum validation."""
		with pytest.raises(ValidationError):
			Img2ImgConfig(init_image='base64', prompt='test', cfg_scale=0.5)  # Below minimum 1


class TestImg2ImgRequest:
	def test_creates_valid_request(self):
		"""Test creating Img2ImgRequest."""
		config = Img2ImgConfig(init_image='base64', prompt='test')
		request = Img2ImgRequest(history_id=1, config=config)

		assert request.history_id == 1
		assert request.config == config

	def test_requires_history_id(self):
		"""Test that history_id is required."""
		config = Img2ImgConfig(init_image='base64', prompt='test')

		with pytest.raises(ValidationError) as exc_info:
			Img2ImgRequest(config=config)

		assert 'history_id' in str(exc_info.value)

	def test_requires_config(self):
		"""Test that config is required."""
		with pytest.raises(ValidationError) as exc_info:
			Img2ImgRequest(history_id=1)

		assert 'config' in str(exc_info.value)
