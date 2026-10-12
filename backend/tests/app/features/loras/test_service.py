"""Tests for LoRA service business logic."""

from unittest.mock import MagicMock, patch

import pytest

from app.database.models import LoRA
from app.features.loras.service import LoRAService


class TestUploadLoRA:
	"""Tests for LoRAService.upload_lora method."""

	def test_upload_lora_success(self):
		"""Test successful LoRA upload."""
		mock_db = MagicMock()
		service = LoRAService()

		# Mock file manager validation and copy
		with (
			patch('app.features.loras.service.lora_file_manager.validate_file', return_value=(True, '')),
			patch(
				'app.features.loras.service.lora_file_manager.copy_file',
				return_value=('/cache/loras/test.safetensors', 'test.safetensors', 102400),
			),
			patch('app.features.loras.service.database_service') as mock_database_service,
		):
			mock_database_service.get_lora_by_file_path.return_value = None  # No duplicate
			mock_lora = LoRA(id=1, name='test', file_path='/cache/loras/test.safetensors', file_size=102400)
			mock_database_service.add_lora.return_value = mock_lora

			result = service.upload_lora(mock_db, '/source/path/test.safetensors')

			assert result.id == 1
			assert result.name == 'test'
			assert result.file_path == '/cache/loras/test.safetensors'
			assert result.file_size == 102400

			mock_database_service.add_lora.assert_called_once_with(
				db=mock_db, name='test', file_path='/cache/loras/test.safetensors', file_size=102400
			)

	def test_upload_lora_validation_fails(self):
		"""Test upload_lora raises ValueError when validation fails."""
		mock_db = MagicMock()
		service = LoRAService()

		with patch('app.features.loras.service.lora_file_manager.validate_file', return_value=(False, 'File is too large')):
			with pytest.raises(ValueError, match='File is too large'):
				service.upload_lora(mock_db, '/source/invalid.safetensors')

	def test_upload_lora_handles_copy_failure(self):
		"""Test upload_lora handles file copy errors."""
		mock_db = MagicMock()
		service = LoRAService()

		with (
			patch('app.features.loras.service.lora_file_manager.validate_file', return_value=(True, 'File is valid')),
			patch('app.features.loras.service.lora_file_manager.copy_file', side_effect=IOError('Disk full')),
		):
			with pytest.raises(IOError, match='Disk full'):
				service.upload_lora(mock_db, '/source/test.safetensors')

	def test_upload_lora_duplicate_file_path(self):
		"""Test upload_lora raises error when LoRA with same file path exists."""
		mock_db = MagicMock()
		service = LoRAService()

		existing_lora = LoRA(id=999, name='existing', file_path='/cache/loras/test.safetensors', file_size=102400)

		with (
			patch('app.features.loras.service.lora_file_manager.validate_file', return_value=(True, '')),
			patch(
				'app.features.loras.service.lora_file_manager.copy_file',
				return_value=('/cache/loras/test.safetensors', 'test.safetensors', 102400),
			),
			patch('app.features.loras.service.database_service') as mock_database_service,
		):
			mock_database_service.get_lora_by_file_path.return_value = existing_lora

			with pytest.raises(ValueError, match='LoRA already exists with this file path'):
				service.upload_lora(mock_db, '/source/test.safetensors')

	def test_upload_lora_database_failure_cleans_up_file(self):
		"""Test upload_lora cleans up copied file when database save fails."""
		mock_db = MagicMock()
		service = LoRAService()

		with (
			patch('app.features.loras.service.lora_file_manager.validate_file', return_value=(True, '')),
			patch(
				'app.features.loras.service.lora_file_manager.copy_file',
				return_value=('/cache/loras/test.safetensors', 'test.safetensors', 102400),
			),
			patch('app.features.loras.service.lora_file_manager.delete_file') as mock_delete,
			patch('app.features.loras.service.database_service') as mock_database_service,
		):
			mock_database_service.get_lora_by_file_path.return_value = None
			mock_database_service.add_lora.side_effect = RuntimeError('Database connection failed')

			with pytest.raises(ValueError, match='Failed to save LoRA to database'):
				service.upload_lora(mock_db, '/source/test.safetensors')

			# Verify file was cleaned up
			mock_delete.assert_called_once_with('/cache/loras/test.safetensors')


class TestGetAllLoRAs:
	"""Tests for LoRAService.get_all_loras method."""

	def test_get_all_loras_returns_list(self):
		"""Test get_all_loras returns list from database."""
		mock_db = MagicMock()
		service = LoRAService()

		mock_loras = [
			LoRA(id=1, name='lora1.safetensors', file_path='/cache/loras/lora1.safetensors', file_size=100000),
			LoRA(id=2, name='lora2.safetensors', file_path='/cache/loras/lora2.safetensors', file_size=200000),
		]

		with patch('app.features.loras.service.database_service') as mock_database_service:
			mock_database_service.get_all_loras.return_value = mock_loras

			result = service.get_all_loras(mock_db)

			assert len(result) == 2
			assert result[0].id == 1
			assert result[1].id == 2
			mock_database_service.get_all_loras.assert_called_once_with(mock_db)

	def test_get_all_loras_returns_empty_list(self):
		"""Test get_all_loras returns empty list when no LoRAs exist."""
		mock_db = MagicMock()
		service = LoRAService()

		with patch('app.features.loras.service.database_service') as mock_database_service:
			mock_database_service.get_all_loras.return_value = []

			result = service.get_all_loras(mock_db)

			assert result == []
			mock_database_service.get_all_loras.assert_called_once_with(mock_db)


class TestGetLoRAById:
	"""Tests for LoRAService.get_lora_by_id method."""

	def test_get_lora_by_id_returns_lora(self):
		"""Test get_lora_by_id returns LoRA when found."""
		mock_db = MagicMock()
		service = LoRAService()

		mock_lora = LoRA(id=5, name='specific.safetensors', file_path='/cache/loras/specific.safetensors', file_size=150000)

		with patch('app.features.loras.service.database_service') as mock_database_service:
			mock_database_service.get_lora_by_id.return_value = mock_lora

			result = service.get_lora_by_id(mock_db, 5)

			assert result.id == 5
			assert result.name == 'specific.safetensors'
			mock_database_service.get_lora_by_id.assert_called_once_with(mock_db, 5)

	def test_get_lora_by_id_raises_when_not_found(self):
		"""Test get_lora_by_id raises ValueError when LoRA doesn't exist."""
		mock_db = MagicMock()
		service = LoRAService()

		with patch('app.features.loras.service.database_service') as mock_database_service:
			mock_database_service.get_lora_by_id.return_value = None

			with pytest.raises(ValueError, match='LoRA with id 999 not found'):
				service.get_lora_by_id(mock_db, 999)

			mock_database_service.get_lora_by_id.assert_called_once_with(mock_db, 999)


class TestDeleteLoRA:
	"""Tests for LoRAService.delete_lora method."""

	def test_delete_lora_success(self):
		"""Test successful LoRA deletion."""
		mock_db = MagicMock()
		service = LoRAService()

		with (
			patch('app.features.loras.service.database_service') as mock_database_service,
			patch('app.features.loras.service.lora_file_manager.delete_file', return_value=True),
		):
			mock_database_service.delete_lora.return_value = '/cache/loras/deleted.safetensors'

			result = service.delete_lora(mock_db, 10)

			assert result == 10
			mock_database_service.delete_lora.assert_called_once_with(mock_db, 10)

	def test_delete_lora_not_found(self):
		"""Test delete_lora raises ValueError when LoRA doesn't exist."""
		mock_db = MagicMock()
		service = LoRAService()

		with patch('app.features.loras.service.database_service') as mock_database_service:
			mock_database_service.delete_lora.side_effect = ValueError('LoRA with id 999 does not exist')

			with pytest.raises(ValueError, match='LoRA with id 999 does not exist'):
				service.delete_lora(mock_db, 999)


class TestLoRAServiceEdgeCases:
	"""Test edge cases and error handling."""

	def test_upload_lora_with_long_filename(self):
		"""Test upload handles long filenames correctly."""
		mock_db = MagicMock()
		service = LoRAService()

		long_name = 'very_long_lora_name_' * 10 + '.safetensors'
		long_stem = 'very_long_lora_name_' * 10  # Name without extension
		long_path = f'/source/{long_name}'

		with (
			patch('app.features.loras.service.lora_file_manager.validate_file', return_value=(True, '')),
			patch(
				'app.features.loras.service.lora_file_manager.copy_file',
				return_value=(f'/cache/loras/{long_name}', long_name, 50000),
			),
			patch('app.features.loras.service.database_service') as mock_database_service,
		):
			mock_database_service.get_lora_by_file_path.return_value = None  # No duplicate
			mock_lora = LoRA(id=1, name=long_stem, file_path=f'/cache/loras/{long_name}', file_size=50000)
			mock_database_service.add_lora.return_value = mock_lora

			result = service.upload_lora(mock_db, long_path)

			assert result.name == long_stem

	def test_get_all_loras_handles_database_error(self):
		"""Test get_all_loras propagates database errors."""
		mock_db = MagicMock()
		service = LoRAService()

		with patch('app.features.loras.service.database_service') as mock_database_service:
			mock_database_service.get_all_loras.side_effect = Exception('Database connection lost')

			with pytest.raises(Exception, match='Database connection lost'):
				service.get_all_loras(mock_db)
