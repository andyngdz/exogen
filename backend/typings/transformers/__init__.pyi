"""Type stubs for transformers library.

This module provides type hints for the transformers library APIs used in this project.
"""

from .tokenization_utils_base import BatchEncoding

class CLIPImageProcessor:
	"""CLIP image processor."""

	@classmethod
	def from_pretrained(cls, pretrained_model_name_or_path: str, **kwargs) -> 'CLIPImageProcessor':
		"""Load pre-trained image processor."""
		...

	def __call__(self, images, **kwargs):
		"""Process images for safety checker."""
		...

class CLIPTokenizer:
	"""CLIP tokenizer for encoding text."""

	@classmethod
	def from_pretrained(
		cls,
		pretrained_model_name_or_path: str,
		*,
		local_files_only: bool = False,
		**kwargs,
	) -> 'CLIPTokenizer':
		"""Load pre-trained tokenizer."""
		...

	def __call__(
		self,
		text: str,
		truncation: bool = False,
		max_length: int = 77,
		**kwargs,
	) -> BatchEncoding:
		"""Tokenize text and return BatchEncoding."""
		...

class CLIPTextModel:
	"""CLIP text encoder model."""

	@classmethod
	def from_pretrained(cls, pretrained_model_name_or_path: str, **kwargs) -> 'CLIPTextModel':
		"""Load pre-trained text encoder."""
		...

class CLIPTextModelWithProjection:
	"""CLIP text encoder model with projection layer (used in SDXL)."""

	@classmethod
	def from_pretrained(cls, pretrained_model_name_or_path: str, **kwargs) -> 'CLIPTextModelWithProjection':
		"""Load pre-trained text encoder with projection."""
		...

class GPT2TokenizerFast:
	"""GPT-2 fast tokenizer."""

	@classmethod
	def from_pretrained(
		cls,
		pretrained_model_name_or_path: str,
		**kwargs,
	) -> 'GPT2TokenizerFast':
		"""Load pre-trained tokenizer."""
		...

	def encode(self, text: str, **kwargs) -> list[int]:
		"""Encode text to token IDs."""
		...

	def decode(self, token_ids: list[int], **kwargs) -> str:
		"""Decode token IDs to text."""
		...
