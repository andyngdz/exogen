"""File management operations for LoRAs."""

import os
import shutil
from pathlib import Path
from uuid import uuid4

from app.services.logger import logger_service
from app.services.storage import storage_service

logger = logger_service.get_logger(__name__, category='Service')

MAX_LORA_FILE_SIZE = 500 * 1024 * 1024  # 500MB


class LoRAFileManager:
	"""Manages LoRA file operations (validation, copying, deletion)."""

	def validate_file(self, file_path: str) -> tuple[bool, str]:
		"""Validate that the file exists, is a .safetensors file, and within size limits.

		Args:
			file_path: Path to the file to validate

		Returns:
			Tuple of (is_valid, error_message)
		"""
		# Check if file exists
		if not os.path.exists(file_path):
			return False, f'File does not exist: {file_path}'

		# Check if it's a file (not a directory)
		if not os.path.isfile(file_path):
			return False, f'Path is not a file: {file_path}'

		# Check file extension
		if not file_path.endswith('.safetensors'):
			return False, 'File must be a .safetensors file'

		# Check file size
		file_size = os.path.getsize(file_path)
		if file_size > MAX_LORA_FILE_SIZE:
			size_mb = file_size / (1024 * 1024)
			limit_mb = MAX_LORA_FILE_SIZE / (1024 * 1024)
			return False, f'File size ({size_mb:.1f}MB) exceeds limit ({limit_mb:.1f}MB)'

		if file_size == 0:
			return False, 'File is empty'

		return True, ''

	def copy_file(self, source_path: str) -> tuple[str, str, int]:
		"""Copy LoRA file to the loras directory.

		Args:
			source_path: Path to the source file

		Returns:
			Tuple of (destination_path, filename, file_size)
		"""
		source = Path(source_path)
		filename = source.name
		file_size = os.path.getsize(source_path)

		# Get destination path
		dest_path = storage_service.get_lora_file_path(filename)

		# Handle duplicate filenames by appending a unique ID
		if os.path.exists(dest_path):
			unique_id = uuid4().hex[:8]
			filename = f'{source.stem}_{unique_id}{source.suffix}'
			dest_path = storage_service.get_lora_file_path(filename)
			logger.info(f'Duplicate filename detected, renamed to: {filename}')

		# Copy the file
		shutil.copy2(source_path, dest_path)
		logger.info(f'Copied LoRA file: {source_path} -> {dest_path} ({file_size} bytes)')

		return dest_path, filename, file_size

	def delete_file(self, file_path: str) -> bool:
		"""Delete a LoRA file.

		Args:
			file_path: Path to the file to delete

		Returns:
			True if file was deleted, False if file didn't exist
		"""
		if os.path.exists(file_path):
			os.remove(file_path)
			logger.info(f'Deleted LoRA file: {file_path}')
			return True

		logger.warning(f'LoRA file not found for deletion: {file_path}')
		return False


lora_file_manager = LoRAFileManager()
