import re
from itertools import chain
from typing import List, Optional

from transformers import CLIPTokenizer, GPT2TokenizerFast

from app.constants.generation import DEFAULT_NEGATIVE_PROMPT
from app.constants.styles import all_styles
from app.schemas.styles import StyleItem
from app.services import logger_service

logger = logger_service.get_logger(__name__, category='Service')

PROMPT_PLACEHOLDER_PATTERN = re.compile(r'\s*\{prompt\},?\s*')
CLIP_MODEL_NAME = 'openai/clip-vit-base-patch32'
GPT2_MODEL_NAME = 'openai-community/gpt2'
MAX_CLIP_TOKENS = 77

# Separator between prompt parts
PROMPT_SEPARATOR = ', '
SEPARATOR_TOKEN_COST = 2  # Estimated tokens for PROMPT_SEPARATOR


class StylesService:
	def __init__(self) -> None:
		super().__init__()
		self._clip_tokenizer: Optional[CLIPTokenizer] = None
		self._gpt2_tokenizer: Optional[GPT2TokenizerFast] = None
		self.all_styles: list[StyleItem] = list(chain.from_iterable(all_styles.values()))

	@property
	def tokenizer(self) -> CLIPTokenizer:
		"""Returns the CLIP tokenizer."""
		if self._clip_tokenizer:
			return self._clip_tokenizer

		self._clip_tokenizer = CLIPTokenizer.from_pretrained(CLIP_MODEL_NAME)
		return self._clip_tokenizer

	@property
	def gpt2_tokenizer(self) -> Optional[GPT2TokenizerFast]:
		"""
		Returns the GPT-2 tokenizer used for smart truncation.
		"""
		if self._gpt2_tokenizer:
			return self._gpt2_tokenizer

		try:
			loaded_tokenizer = GPT2TokenizerFast.from_pretrained(GPT2_MODEL_NAME)
			self._gpt2_tokenizer = loaded_tokenizer
		except Exception as exception:
			logger.warning(f'Failed to load GPT-2 tokenizer: {exception}')

		return self._gpt2_tokenizer

	def count_tokens(self, input_text: str) -> int:
		"""
		Counts the number of tokens in the text using the CLIP tokenizer.
		"""
		tokenizer = self.tokenizer
		encoded = tokenizer(input_text, truncation=True, max_length=MAX_CLIP_TOKENS)
		return len(encoded.input_ids)

	def truncate(self, input_text: str, max_tokens: int) -> str:
		"""
		Truncates text to fit within max_tokens.
		Uses GPT-2 tokenizer for smart truncation if available, otherwise splits by words.
		"""
		if self.gpt2_tokenizer:
			tokens = self.gpt2_tokenizer.encode(input_text)

			while tokens:
				decoded = self.gpt2_tokenizer.decode(tokens)
				decoded_text = decoded.strip()
				if self.count_tokens(decoded_text) <= max_tokens:
					return decoded_text
				tokens.pop()

			return ''

		# Fallback: Word-based truncation
		words = input_text.split()
		while words:
			current_text = ' '.join(words)
			if self.count_tokens(current_text) <= max_tokens:
				return current_text
			words.pop()

		return ''

	def __extract_style_additions(self, selected_styles: list[StyleItem]) -> str:
		"""Extract and combine positive style additions from selected styles."""
		additions: list[str] = []

		# First style: remove {prompt} placeholder completely
		first_style = selected_styles[0]
		if first_style.positive:
			cleaned = PROMPT_PLACEHOLDER_PATTERN.sub('', first_style.positive).strip(' ,')
			if cleaned:
				additions.append(cleaned)

		# Remaining styles: replace {prompt} with space
		for style in selected_styles[1:]:
			if style.positive:
				cleaned = PROMPT_PLACEHOLDER_PATTERN.sub(' ', style.positive).strip(' ,')
				if cleaned:
					additions.append(cleaned)

		# Remove duplicates while preserving order
		unique_additions: list[str] = list(dict.fromkeys(additions))
		return PROMPT_SEPARATOR.join(unique_additions)

	def __build_positive_prompt(self, user_prompt: str, selected_styles: list[StyleItem]) -> str:
		"""Build combined positive prompt from user input and styles."""
		styles_string = self.__extract_style_additions(selected_styles)

		if not styles_string:
			return user_prompt

		user_tokens = self.count_tokens(user_prompt)

		# User prompt alone exceeds limit - truncate and ignore styles
		if user_tokens >= MAX_CLIP_TOKENS:
			return self.truncate(user_prompt, MAX_CLIP_TOKENS)

		# Check if everything fits
		total_tokens = user_tokens + self.count_tokens(styles_string) + SEPARATOR_TOKEN_COST
		if total_tokens <= MAX_CLIP_TOKENS:
			return f'{user_prompt}{PROMPT_SEPARATOR}{styles_string}'

		# Need to truncate styles
		available_for_styles = MAX_CLIP_TOKENS - user_tokens - SEPARATOR_TOKEN_COST
		truncated_styles = self.truncate(styles_string, available_for_styles)

		if truncated_styles:
			return f'{user_prompt}{PROMPT_SEPARATOR}{truncated_styles}'

		return user_prompt

	def __build_negative_prompt(self, user_negative: str, selected_styles: list[StyleItem]) -> str:
		"""Build combined negative prompt from user input and styles."""
		parts: list[str] = []

		if user_negative:
			parts.append(user_negative)

		for style in selected_styles:
			if style.negative:
				parts.append(style.negative)

		# Remove duplicates while preserving order
		unique_parts: list[str] = list(dict.fromkeys(parts))
		combined = PROMPT_SEPARATOR.join(unique_parts)

		if not combined:
			return DEFAULT_NEGATIVE_PROMPT

		# Truncate if exceeds limit
		if self.count_tokens(combined) > MAX_CLIP_TOKENS:
			return self.truncate(combined, MAX_CLIP_TOKENS)

		return combined

	def apply_styles(
		self,
		user_prompt: str,
		user_negative_prompt: str,
		style_identifiers: List[str],
	) -> List[str]:
		"""
		Applies selected styles to the user prompt.
		Returns a list containing [positive_prompt, negative_prompt].
		"""
		selected_styles = [style for style in self.all_styles if style.id in style_identifiers]

		if not selected_styles:
			return [user_prompt, user_negative_prompt]

		positive_prompt = self.__build_positive_prompt(user_prompt, selected_styles)
		negative_prompt = self.__build_negative_prompt(user_negative_prompt, selected_styles)

		return [positive_prompt, negative_prompt]


styles_service = StylesService()
