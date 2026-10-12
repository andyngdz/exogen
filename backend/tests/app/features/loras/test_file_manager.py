"""Tests for LoRA file manager operations."""

import os
from unittest.mock import patch

import pytest

from app.features.loras.file_manager import LoRAFileManager


class TestValidateFile:
	"""Tests for LoRAFileManager.validate_file method."""

	def test_validate_file_success(self, tmp_path):
		"""Test validate_file returns True for valid file."""
		# Create a valid test file
		test_file = tmp_path / 'test_lora.safetensors'
		test_file.write_bytes(b'test content' * 1000)  # Write some data

		manager = LoRAFileManager()
		is_valid, message = manager.validate_file(str(test_file))

		assert is_valid is True
		assert message == ''  # Empty message on success

	def test_validate_file_nonexistent(self):
		"""Test validate_file returns False for nonexistent file."""
		manager = LoRAFileManager()
		is_valid, message = manager.validate_file('/nonexistent/path/file.safetensors')

		assert is_valid is False
		assert 'File does not exist' in message

	def test_validate_file_wrong_extension(self, tmp_path):
		"""Test validate_file returns False for non-safetensors file."""
		test_file = tmp_path / 'test_lora.txt'
		test_file.write_text('not a safetensors file')

		manager = LoRAFileManager()
		is_valid, message = manager.validate_file(str(test_file))

		assert is_valid is False
		assert 'must be a .safetensors file' in message

	def test_validate_file_too_large(self, tmp_path):
		"""Test validate_file returns False for file exceeding size limit."""
		test_file = tmp_path / 'huge.safetensors'
		test_file.touch()  # Create file

		manager = LoRAFileManager()

		# Mock file size to exceed limit
		with patch('os.path.getsize', return_value=600 * 1024 * 1024):  # 600MB
			is_valid, message = manager.validate_file(str(test_file))

			assert is_valid is False
			assert 'exceeds limit' in message

	def test_validate_file_empty(self, tmp_path):
		"""Test validate_file returns False for empty file."""
		test_file = tmp_path / 'empty.safetensors'
		test_file.touch()  # Create empty file

		manager = LoRAFileManager()
		is_valid, message = manager.validate_file(str(test_file))

		assert is_valid is False
		assert 'File is empty' in message


class TestCopyFile:
	"""Tests for LoRAFileManager.copy_file method."""

	def test_copy_file_success(self, tmp_path):
		"""Test copy_file successfully copies file to destination."""
		# Create source file
		source_dir = tmp_path / 'source'
		source_dir.mkdir()
		source_file = source_dir / 'test_lora.safetensors'
		test_content = b'test lora content' * 1000
		source_file.write_bytes(test_content)

		# Create destination directory
		dest_dir = tmp_path / 'dest'
		dest_dir.mkdir()

		manager = LoRAFileManager()

		# Mock storage service to return our temp destination
		with patch('app.features.loras.file_manager.storage_service') as mock_storage:
			mock_storage.get_loras_dir.return_value = str(dest_dir)
			mock_storage.get_lora_file_path.return_value = str(dest_dir / 'test_lora.safetensors')

			dest_path, filename, file_size = manager.copy_file(str(source_file))

			# Verify file was copied
			assert os.path.exists(dest_path)
			assert filename == 'test_lora.safetensors'
			assert file_size == len(test_content)

			# Verify content matches
			with open(dest_path, 'rb') as f:
				assert f.read() == test_content

	def test_copy_file_handles_duplicate_names(self, tmp_path):
		"""Test copy_file handles duplicate filenames by appending unique ID."""
		source_dir = tmp_path / 'source'
		source_dir.mkdir()
		source_file = source_dir / 'duplicate.safetensors'
		source_file.write_bytes(b'content')

		dest_dir = tmp_path / 'dest'
		dest_dir.mkdir()

		# Create existing file with same name
		existing_file = dest_dir / 'duplicate.safetensors'
		existing_file.write_bytes(b'existing')

		manager = LoRAFileManager()

		with patch('app.features.loras.file_manager.storage_service') as mock_storage:
			mock_storage.get_loras_dir.return_value = str(dest_dir)
			mock_storage.get_lora_file_path.side_effect = lambda filename: str(dest_dir / filename)

			dest_path, filename, file_size = manager.copy_file(str(source_file))

			# Should have created version with unique ID (not original name)
			assert filename != 'duplicate.safetensors'
			assert filename.startswith('duplicate_')
			assert filename.endswith('.safetensors')
			assert os.path.exists(dest_path)

	def test_copy_file_raises_for_nonexistent_source(self):
		"""Test copy_file raises FileNotFoundError for nonexistent source."""
		manager = LoRAFileManager()

		with pytest.raises(FileNotFoundError):
			manager.copy_file('/nonexistent/source/file.safetensors')


class TestDeleteFile:
	"""Tests for LoRAFileManager.delete_file method."""

	def test_delete_file_success(self, tmp_path):
		"""Test delete_file successfully removes file."""
		test_file = tmp_path / 'to_delete.safetensors'
		test_file.write_bytes(b'content')

		assert test_file.exists()

		manager = LoRAFileManager()
		result = manager.delete_file(str(test_file))

		assert result is True
		assert not test_file.exists()

	def test_delete_file_nonexistent(self):
		"""Test delete_file returns False for nonexistent file."""
		manager = LoRAFileManager()
		result = manager.delete_file('/nonexistent/file.safetensors')

		assert result is False

	def test_delete_file_calls_os_remove(self, tmp_path):
		"""Test delete_file calls os.remove for existing files."""
		test_file = tmp_path / 'protected.safetensors'
		test_file.write_bytes(b'content')

		manager = LoRAFileManager()

		# Mock os.remove to verify it's called
		with patch('os.remove') as mock_remove:
			with patch('os.path.exists', return_value=True):
				result = manager.delete_file(str(test_file))

				assert result is True
				mock_remove.assert_called_once_with(str(test_file))


class TestLoRAFileManagerEdgeCases:
	"""Test edge cases and error handling."""

	def test_validate_file_with_special_characters(self, tmp_path):
		"""Test validate_file handles filenames with special characters."""
		test_file = tmp_path / 'lora-special_chars (1).safetensors'
		test_file.write_bytes(b'test' * 100)

		manager = LoRAFileManager()
		is_valid, message = manager.validate_file(str(test_file))

		assert is_valid is True

	def test_copy_file_preserves_file_integrity(self, tmp_path):
		"""Test that copied file has identical content to source."""
		source_dir = tmp_path / 'source'
		source_dir.mkdir()
		source_file = source_dir / 'integrity_test.safetensors'

		# Create file with specific binary content
		original_content = bytes(range(256)) * 1000
		source_file.write_bytes(original_content)

		dest_dir = tmp_path / 'dest'
		dest_dir.mkdir()

		manager = LoRAFileManager()

		with patch('app.features.loras.file_manager.storage_service') as mock_storage:
			mock_storage.get_loras_dir.return_value = str(dest_dir)
			mock_storage.get_lora_file_path.return_value = str(dest_dir / 'integrity_test.safetensors')

			dest_path, _, _ = manager.copy_file(str(source_file))

			# Verify byte-for-byte match
			with open(dest_path, 'rb') as f:
				copied_content = f.read()

			assert copied_content == original_content
