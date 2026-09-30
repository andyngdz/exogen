"""Tests for the styles service."""

from typing import Any
from unittest.mock import Mock, patch

import pytest

from app.schemas.styles import StyleItem
from app.services.styles import StylesService


class TestStylesService:
	"""Test the StylesService class."""

	@pytest.fixture(autouse=True)
	def mock_tokenizer(self):
		"""Mock the CLIP tokenizer to avoid loading actual model files."""
		with patch('app.services.styles.CLIPTokenizer.from_pretrained') as mock_clip:
			# Mock the CLIP tokenizer
			mock_tokenizer = Mock()

			# Make the tokenizer callable and return a mock with input_ids
			def mock_encode(text: str, **kwargs: Any) -> Mock:
				# Simple mock: return list of token IDs based on word count
				return Mock(input_ids=list(range(len(text.split()) + 2)))

			mock_tokenizer.side_effect = mock_encode
			mock_clip.return_value = mock_tokenizer
			yield

	@pytest.fixture
	def service(self) -> StylesService:
		"""Create a fresh StylesService instance for each test."""
		return StylesService()

	@pytest.fixture
	def mock_styles(self) -> list[StyleItem]:
		"""Create mock style items for testing."""
		return [
			StyleItem(
				id='style1',
				name='Photorealistic',
				positive='photorealistic, {prompt}, highly detailed',
				negative='cartoon, anime',
				image='https://example.com/style1.jpg',
			),
			StyleItem(
				id='style2',
				name='Cinematic',
				positive='cinematic lighting, {prompt}, dramatic',
				negative='flat lighting',
				image='https://example.com/style2.jpg',
			),
			StyleItem(
				id='style3',
				name='Portrait',
				positive='portrait, professional photography',
				negative='',
				image='https://example.com/style3.jpg',
			),
		]

	def test_count_tokens_basic(self, service: StylesService) -> None:
		"""Test basic token counting."""
		text = 'a beautiful sunset over mountains'
		token_count = service.count_tokens(text)

		# Should return positive integer
		assert isinstance(token_count, int)
		assert token_count > 0

	def test_count_tokens_empty_string(self, service: StylesService) -> None:
		"""Test token counting with empty string."""
		token_count = service.count_tokens('')

		# Empty string should have minimal tokens
		assert token_count >= 0

	def test_count_tokens_long_text(self, service: StylesService) -> None:
		"""Test that long text is properly tokenized."""
		# Create text longer than 77 tokens
		long_text = ' '.join(['word'] * 100)
		token_count = service.count_tokens(long_text)

		# Should still return a count
		assert isinstance(token_count, int)
		assert token_count > 0

	def test_truncate_text_within_limit(self, service: StylesService) -> None:
		"""Test truncation of text that's already within token limit."""
		text = 'short text'
		result = service.truncate(text, max_tokens=50)

		assert result == text

	def test_truncate_text_exceeds_limit(self, service: StylesService) -> None:
		"""Test truncation of text exceeding token limit."""
		long_text = ' '.join(['word'] * 100)
		result = service.truncate(long_text, max_tokens=10)

		# Result should be shorter than original
		assert len(result) < len(long_text)
		# Result should fit within token limit
		assert service.count_tokens(result) <= 10

	def test_truncate_returns_empty_if_impossible(self, service: StylesService) -> None:
		"""Test that truncate returns empty string if even first word exceeds limit."""
		result = service.truncate('word', max_tokens=0)

		assert result == ''

	def test_apply_styles_no_styles_selected(self, service: StylesService, mock_styles: list[StyleItem]) -> None:
		"""Test applying styles when no styles are selected."""
		service.all_styles = mock_styles

		result = service.apply_styles(
			user_prompt='test prompt',
			user_negative_prompt='test negative',
			style_identifiers=[],
		)

		# Should return unchanged prompts
		assert result == ['test prompt', 'test negative']

	def test_apply_styles_single_style(self, service: StylesService, mock_styles: list[StyleItem]) -> None:
		"""Test applying a single style."""
		service.all_styles = mock_styles

		result = service.apply_styles(
			user_prompt='beautiful landscape',
			user_negative_prompt='',
			style_identifiers=['style1'],
		)

		positive, negative = result

		# Positive should contain user prompt and style additions
		assert 'beautiful landscape' in positive
		assert 'photorealistic' in positive
		assert 'highly detailed' in positive

		# Negative should use style's negative prompt
		assert 'cartoon' in negative
		assert 'anime' in negative

	def test_apply_styles_multiple_styles(self, service: StylesService, mock_styles: list[StyleItem]) -> None:
		"""Test applying multiple styles."""
		service.all_styles = mock_styles

		result = service.apply_styles(
			user_prompt='portrait of a person',
			user_negative_prompt='',
			style_identifiers=['style1', 'style2'],
		)

		positive, negative = result

		# Positive should contain user prompt and all style additions
		assert 'portrait of a person' in positive
		assert 'photorealistic' in positive
		assert 'cinematic lighting' in positive

		# Negative should contain both style negatives
		assert 'cartoon' in negative
		assert 'flat lighting' in negative

	def test_apply_styles_uses_default_negative_when_empty(
		self, service: StylesService, mock_styles: list[StyleItem]
	) -> None:
		"""Test that default negative prompt is used when user provides none."""
		service.all_styles = mock_styles

		result = service.apply_styles(
			user_prompt='test',
			user_negative_prompt='',
			style_identifiers=[],
		)

		_, negative = result

		# Should return user's negative (empty in this case means default)
		assert negative == ''

	def test_apply_styles_preserves_user_negative(self, service: StylesService, mock_styles: list[StyleItem]) -> None:
		"""Test that user's negative prompt is preserved and combined with style negatives."""
		service.all_styles = mock_styles

		result = service.apply_styles(
			user_prompt='test',
			user_negative_prompt='user negative',
			style_identifiers=['style1'],
		)

		_, negative = result

		# Should contain both user negative and style negative
		assert 'user negative' in negative
		assert 'cartoon' in negative

	def test_apply_styles_removes_duplicates(self, service: StylesService, mock_styles: list[StyleItem]) -> None:
		"""Test that duplicate style additions are removed."""
		# Create styles with overlapping content
		duplicate_styles = [
			StyleItem(
				id='dup1',
				name='Dup1',
				positive='{prompt}, detailed',
				negative='bad quality',
				image='https://example.com/dup1.jpg',
			),
			StyleItem(
				id='dup2',
				name='Dup2',
				positive='{prompt}, detailed',  # Duplicate
				negative='bad quality',  # Duplicate
				image='https://example.com/dup2.jpg',
			),
		]
		service.all_styles = duplicate_styles

		result = service.apply_styles(
			user_prompt='test',
			user_negative_prompt='',
			style_identifiers=['dup1', 'dup2'],
		)

		positive, negative = result

		# Count occurrences - should only appear once
		assert positive.count('detailed') == 1
		assert negative.count('bad quality') == 1

	def test_apply_styles_truncates_if_exceeds_token_limit(self, service: StylesService) -> None:
		"""Test that combined prompt is truncated if it exceeds token limit."""
		# Create a very long user prompt
		very_long_prompt = ' '.join(['word'] * 100)

		# Create a style that would push it over
		long_style = StyleItem(
			id='long',
			name='Long',
			positive='{prompt}, ' + ', '.join(['adjective'] * 50),
			negative='',
			image='https://example.com/long.jpg',
		)
		service.all_styles = [long_style]

		result = service.apply_styles(
			user_prompt=very_long_prompt,
			user_negative_prompt='',
			style_identifiers=['long'],
		)

		positive, _ = result

		# Result should be truncated to fit token limit (77 tokens)
		assert service.count_tokens(positive) <= 77

	def test_tokenizer_is_available(self, service: StylesService) -> None:
		"""Test that tokenizer is available for use."""
		# Tokenizer should be accessible
		tokenizer = service.tokenizer

		# Should be loaded and functional
		assert tokenizer is not None

		# Should return same instance on subsequent calls (caching)
		assert service.tokenizer is tokenizer

	def test_gpt2_tokenizer_is_available(self, service: StylesService) -> None:
		"""Test that GPT-2 tokenizer is available if loading succeeds."""
		# Access tokenizer property
		tokenizer = service.gpt2_tokenizer

		# Tokenizer may be None if loading fails, which is acceptable
		# If loaded, subsequent calls should return same instance
		if tokenizer is not None:
			assert service.gpt2_tokenizer is tokenizer

	@patch('app.services.styles.GPT2TokenizerFast')
	def test_gpt2_tokenizer_handles_loading_failure(self, mock_gpt2_class: Mock, service: StylesService) -> None:
		"""Test that GPT-2 tokenizer gracefully handles loading failures."""
		# Make GPT-2 loading fail
		mock_gpt2_class.from_pretrained.side_effect = Exception('Loading failed')

		# Should return None instead of raising
		tokenizer = service.gpt2_tokenizer

		assert tokenizer is None

	def test_apply_styles_with_nonexistent_style_id(self, service: StylesService, mock_styles: list[StyleItem]) -> None:
		"""Test that nonexistent style IDs are ignored."""
		service.all_styles = mock_styles

		result = service.apply_styles(
			user_prompt='test',
			user_negative_prompt='',
			style_identifiers=['nonexistent'],
		)

		# Should return unchanged prompts since style doesn't exist
		assert result == ['test', '']

	def test_apply_styles_prompt_placeholder_removed_from_first_style(self, service: StylesService) -> None:
		"""Test that {prompt} placeholder is properly handled in first style."""
		style_with_placeholder = StyleItem(
			id='test',
			name='Test',
			positive='before {prompt} after',
			negative='',
			image='https://example.com/test.jpg',
		)
		service.all_styles = [style_with_placeholder]

		result = service.apply_styles(
			user_prompt='user text',
			user_negative_prompt='',
			style_identifiers=['test'],
		)

		positive, _ = result

		# {prompt} should be removed from first style
		assert '{prompt}' not in positive
		assert 'user text' in positive
		assert 'before' in positive
		assert 'after' in positive

	@patch('app.services.styles.GPT2TokenizerFast')
	def test_truncate_uses_word_fallback_when_gpt2_unavailable(self, mock_gpt2_class: Mock) -> None:
		"""Test that word-based truncation is used when GPT-2 tokenizer is unavailable."""
		# Make GPT-2 fail to load
		mock_gpt2_class.from_pretrained.side_effect = Exception('Loading failed')

		# Create fresh service so it tries to load GPT-2 and fails
		fresh_service = StylesService()

		long_text = ' '.join(['word'] * 20)
		result = fresh_service.truncate(long_text, max_tokens=5)

		# Should still truncate using word-based fallback
		assert len(result) < len(long_text)
		assert fresh_service.count_tokens(result) <= 5

	def test_apply_styles_with_empty_positive_fields(self, service: StylesService) -> None:
		"""Test that styles with empty positive fields are handled correctly."""
		empty_styles = [
			StyleItem(
				id='empty1',
				name='Empty',
				positive='',  # Empty positive
				negative='bad',
				image='https://example.com/empty.jpg',
			),
			StyleItem(
				id='valid',
				name='Valid',
				positive='good quality',
				negative='poor',
				image='https://example.com/valid.jpg',
			),
		]
		service.all_styles = empty_styles

		result = service.apply_styles(
			user_prompt='test',
			user_negative_prompt='',
			style_identifiers=['empty1', 'valid'],
		)

		positive, negative = result

		# Should only include the valid style's positive
		assert 'good quality' in positive
		assert 'test' in positive

		# Both negatives should be included
		assert 'bad' in negative
		assert 'poor' in negative

	def test_apply_styles_all_empty_positives_returns_user_prompt(self, service: StylesService) -> None:
		"""Test that when all styles have empty positives, only user prompt is returned."""
		empty_styles = [
			StyleItem(
				id='empty1',
				name='Empty1',
				positive='',
				negative='neg1',
				image='https://example.com/e1.jpg',
			),
			StyleItem(
				id='empty2',
				name='Empty2',
				positive='',
				negative='neg2',
				image='https://example.com/e2.jpg',
			),
		]
		service.all_styles = empty_styles

		result = service.apply_styles(
			user_prompt='my prompt',
			user_negative_prompt='',
			style_identifiers=['empty1', 'empty2'],
		)

		positive, negative = result

		# Positive should just be user prompt since all style positives are empty
		assert positive == 'my prompt'

		# Negatives should still be combined
		assert 'neg1' in negative
		assert 'neg2' in negative

	def test_apply_styles_truncates_styles_when_combined_too_long(self, service: StylesService) -> None:
		"""Test that style additions are truncated when combined prompt exceeds limit."""
		# Create user prompt that's large but not exceeding limit
		medium_prompt = ' '.join(['word'] * 30)

		# Create style that would push combined over limit
		large_style = StyleItem(
			id='large',
			name='Large',
			positive='{prompt}, ' + ', '.join(['quality'] * 60),
			negative='',
			image='https://example.com/large.jpg',
		)
		service.all_styles = [large_style]

		result = service.apply_styles(
			user_prompt=medium_prompt,
			user_negative_prompt='',
			style_identifiers=['large'],
		)

		positive, _ = result

		# Combined should not exceed limit
		assert service.count_tokens(positive) <= 77

		# User prompt should still be present
		assert medium_prompt in positive

	def test_apply_styles_truncates_long_negative_prompt(self, service: StylesService) -> None:
		"""Test that negative prompt is truncated if it exceeds token limit."""
		# Create very long negative prompt through styles
		long_neg_styles = [
			StyleItem(
				id=f'neg{i}',
				name=f'Neg{i}',
				positive='good',
				negative=', '.join(['bad'] * 30),
				image=f'https://example.com/neg{i}.jpg',
			)
			for i in range(5)
		]
		service.all_styles = long_neg_styles

		result = service.apply_styles(
			user_prompt='test',
			user_negative_prompt='user negative',
			style_identifiers=[s.id for s in long_neg_styles],
		)

		_, negative = result

		# Negative should be truncated to fit within limit
		assert service.count_tokens(negative) <= 77

	def test_truncate_returns_empty_when_first_word_too_long(self, service: StylesService) -> None:
		"""Test truncate returns empty string when even first word exceeds max_tokens."""
		result = service.truncate('verylongword', max_tokens=0)

		assert result == ''

	def test_apply_styles_with_only_placeholder_in_positive(self, service: StylesService) -> None:
		"""Test that styles with only {prompt} placeholder result in empty positive."""
		placeholder_only = StyleItem(
			id='placeholder',
			name='Placeholder',
			positive='{prompt}',  # Only placeholder, nothing else
			negative='neg',
			image='https://example.com/placeholder.jpg',
		)
		service.all_styles = [placeholder_only]

		result = service.apply_styles(
			user_prompt='user text',
			user_negative_prompt='',
			style_identifiers=['placeholder'],
		)

		positive, _ = result

		# Should return just user prompt since style positive becomes empty after placeholder removal
		assert positive == 'user text'

	def test_apply_styles_truncated_styles_empty_returns_user_prompt(self, service: StylesService) -> None:
		"""Test that when truncated styles become empty, only user prompt is returned."""
		# Create user prompt that takes almost all tokens
		large_prompt = ' '.join(['word'] * 75)

		# Create style that can't fit even one word
		style = StyleItem(
			id='tiny',
			name='Tiny',
			positive='{prompt}, quality',
			negative='',
			image='https://example.com/tiny.jpg',
		)
		service.all_styles = [style]

		result = service.apply_styles(
			user_prompt=large_prompt,
			user_negative_prompt='',
			style_identifiers=['tiny'],
		)

		positive, _ = result

		# Should return truncated user prompt only (styles can't fit)
		assert service.count_tokens(positive) <= 77
		# Result should be similar to user prompt (styles were dropped)
		assert 'word' in positive
