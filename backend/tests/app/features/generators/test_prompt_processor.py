"""Tests for prompt_processor module."""

from unittest.mock import patch

import pytest

from app.schemas.generators import GeneratorConfig


@pytest.fixture
def sample_config():
	"""Create a sample generator config."""
	return GeneratorConfig(
		prompt='test prompt',
		negative_prompt='bad quality',
		styles=['style1', 'style2'],
		width=512,
		height=512,
		number_of_images=1,
		steps=20,
	)


class TestPreparePrompts:
	"""Test prepare_prompts() method."""

	@patch('app.cores.generation.prompt_processor.styles_service')
	def test_calls_styles_service_with_correct_params(self, mock_styles_service, sample_config):
		"""Test that styles_service.apply_styles is called with correct parameters."""
		from app.cores.generation.prompt_processor import PromptProcessor

		# Setup
		mock_styles_service.apply_styles.return_value = ('processed positive', 'processed negative')
		processor = PromptProcessor()

		# Execute
		result = processor.prepare_prompts(sample_config)

		# Verify
		mock_styles_service.apply_styles.assert_called_once_with(
			'test prompt',
			'bad quality',
			['style1', 'style2'],
		)
		assert result == ('processed positive', 'processed negative')

	@patch('app.cores.generation.prompt_processor.styles_service')
	def test_returns_tuple_of_prompts(self, mock_styles_service, sample_config):
		"""Test that method returns a tuple of (positive, negative) prompts."""
		from app.cores.generation.prompt_processor import PromptProcessor

		# Setup
		mock_styles_service.apply_styles.return_value = ('final positive prompt', 'final negative prompt')
		processor = PromptProcessor()

		# Execute
		positive, negative = processor.prepare_prompts(sample_config)

		# Verify
		assert isinstance(positive, str)
		assert isinstance(negative, str)
		assert positive == 'final positive prompt'
		assert negative == 'final negative prompt'

	@patch('app.cores.generation.prompt_processor.styles_service')
	def test_handles_empty_styles_list(self, mock_styles_service):
		"""Test processing with empty styles list."""
		from app.cores.generation.prompt_processor import PromptProcessor

		# Setup
		config = GeneratorConfig(
			prompt='test',
			negative_prompt='bad',
			styles=[],
			width=512,
			height=512,
			number_of_images=1,
			steps=20,
		)
		mock_styles_service.apply_styles.return_value = ('test', 'bad')
		processor = PromptProcessor()

		# Execute
		result = processor.prepare_prompts(config)

		# Verify
		mock_styles_service.apply_styles.assert_called_once_with('test', 'bad', [])
		assert result == ('test', 'bad')

	@patch('app.cores.generation.prompt_processor.logger')
	@patch('app.cores.generation.prompt_processor.styles_service')
	def test_logs_processed_prompts(self, mock_styles_service, mock_logger, sample_config):
		"""Test that processed prompts are logged."""
		from app.cores.generation.prompt_processor import PromptProcessor

		# Setup
		mock_styles_service.apply_styles.return_value = ('positive result', 'negative result')
		processor = PromptProcessor()

		# Execute
		processor.prepare_prompts(sample_config)

		# Verify logging calls
		assert mock_logger.info.call_count == 2
		mock_logger.info.assert_any_call('Positive prompt after clipping: positive result')
		mock_logger.info.assert_any_call('Negative prompt after clipping: negative result')


class TestPromptProcessorSingleton:
	"""Test prompt_processor singleton."""

	def test_singleton_exists(self):
		"""Test that prompt_processor singleton instance exists."""
		from app.cores.generation.prompt_processor import prompt_processor

		assert prompt_processor is not None

	def test_singleton_has_prepare_prompts_method(self):
		"""Test that singleton has prepare_prompts method."""
		from app.cores.generation.prompt_processor import prompt_processor

		assert hasattr(prompt_processor, 'prepare_prompts')
		assert callable(prompt_processor.prepare_prompts)
