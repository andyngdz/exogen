"""Tests for the database CRUD operations including LoRA management."""

from unittest.mock import MagicMock

from sqlalchemy.orm import Session

from app.database import crud as database_service
from app.database.models import LoRA


class TestAddLoRA:
	"""Tests for add_lora function."""

	def test_add_lora_creates_new_record(self):
		"""Test that add_lora creates a new LoRA record."""
		# Arrange
		mock_db = MagicMock(spec=Session)

		# Act
		result = database_service.add_lora(
			db=mock_db, name='Test LoRA', file_path='/cache/loras/test.safetensors', file_size=1024000
		)

		# Assert
		assert isinstance(result, LoRA)
		assert result.name == 'Test LoRA'
		assert result.file_path == '/cache/loras/test.safetensors'
		assert result.file_size == 1024000
		mock_db.add.assert_called_once()
		mock_db.commit.assert_called_once()
		mock_db.refresh.assert_called_once_with(result)

	def test_add_lora_with_different_sizes(self):
		"""Test add_lora with various file sizes."""
		mock_db = MagicMock(spec=Session)

		# Small LoRA
		small_lora = database_service.add_lora(
			db=mock_db, name='Small', file_path='/cache/loras/small.safetensors', file_size=10485760
		)
		assert small_lora.file_size == 10485760

		# Large LoRA
		large_lora = database_service.add_lora(
			db=mock_db, name='Large', file_path='/cache/loras/large.safetensors', file_size=209715200
		)
		assert large_lora.file_size == 209715200


class TestGetAllLoRAs:
	"""Tests for get_all_loras function."""

	def test_get_all_loras_returns_list(self):
		"""Test that get_all_loras returns list of LoRAs."""
		# Arrange
		mock_db = MagicMock(spec=Session)
		mock_query = MagicMock()
		mock_db.query.return_value = mock_query

		mock_lora1 = MagicMock()
		mock_lora1.id = 1
		mock_lora1.name = 'LoRA 1'

		mock_lora2 = MagicMock()
		mock_lora2.id = 2
		mock_lora2.name = 'LoRA 2'

		mock_query.all.return_value = [mock_lora1, mock_lora2]

		# Act
		result = database_service.get_all_loras(mock_db)

		# Assert
		assert len(result) == 2
		assert result[0].id == 1
		assert result[1].id == 2
		mock_db.query.assert_called_once_with(LoRA)
		mock_query.all.assert_called_once()

	def test_get_all_loras_returns_empty_list(self):
		"""Test get_all_loras returns empty list when no LoRAs exist."""
		# Arrange
		mock_db = MagicMock(spec=Session)
		mock_query = MagicMock()
		mock_db.query.return_value = mock_query
		mock_query.all.return_value = []

		# Act
		result = database_service.get_all_loras(mock_db)

		# Assert
		assert result == []
		mock_db.query.assert_called_once_with(LoRA)
		mock_query.all.assert_called_once()


class TestGetLoRAById:
	"""Tests for get_lora_by_id function."""

	def test_get_lora_by_id_returns_lora(self):
		"""Test that get_lora_by_id returns LoRA when found."""
		# Arrange
		mock_db = MagicMock(spec=Session)
		mock_query = MagicMock()
		mock_db.query.return_value = mock_query

		mock_filter = MagicMock()
		mock_query.filter.return_value = mock_filter

		mock_lora = MagicMock()
		mock_lora.id = 123
		mock_lora.name = 'Found LoRA'
		mock_filter.first.return_value = mock_lora

		# Act
		result = database_service.get_lora_by_id(mock_db, 123)

		# Assert
		assert result is not None
		assert result == mock_lora
		assert result.id == 123
		mock_db.query.assert_called_once_with(LoRA)
		mock_filter.first.assert_called_once()

	def test_get_lora_by_id_returns_none_when_not_found(self):
		"""Test get_lora_by_id returns None when LoRA doesn't exist."""
		# Arrange
		mock_db = MagicMock(spec=Session)
		mock_query = MagicMock()
		mock_db.query.return_value = mock_query

		mock_filter = MagicMock()
		mock_query.filter.return_value = mock_filter
		mock_filter.first.return_value = None

		# Act
		result = database_service.get_lora_by_id(mock_db, 999)

		# Assert
		assert result is None
		mock_db.query.assert_called_once_with(LoRA)
		mock_filter.first.assert_called_once()


class TestGetLoRAByFilePath:
	"""Tests for get_lora_by_file_path function."""

	def test_get_lora_by_file_path_returns_lora(self):
		"""Test that get_lora_by_file_path returns LoRA when found."""
		# Arrange
		mock_db = MagicMock(spec=Session)
		mock_query = MagicMock()
		mock_db.query.return_value = mock_query

		mock_filter = MagicMock()
		mock_query.filter.return_value = mock_filter

		mock_lora = MagicMock()
		mock_lora.id = 1
		mock_lora.file_path = '/cache/loras/test.safetensors'
		mock_filter.first.return_value = mock_lora

		# Act
		result = database_service.get_lora_by_file_path(mock_db, '/cache/loras/test.safetensors')

		# Assert
		assert result is not None
		assert result == mock_lora
		assert result.file_path == '/cache/loras/test.safetensors'
		mock_db.query.assert_called_once_with(LoRA)
		mock_filter.first.assert_called_once()

	def test_get_lora_by_file_path_returns_none_when_not_found(self):
		"""Test get_lora_by_file_path returns None when path doesn't exist."""
		# Arrange
		mock_db = MagicMock(spec=Session)
		mock_query = MagicMock()
		mock_db.query.return_value = mock_query

		mock_filter = MagicMock()
		mock_query.filter.return_value = mock_filter
		mock_filter.first.return_value = None

		# Act
		result = database_service.get_lora_by_file_path(mock_db, '/cache/loras/nonexistent.safetensors')

		# Assert
		assert result is None
		mock_db.query.assert_called_once_with(LoRA)
		mock_filter.first.assert_called_once()


class TestDeleteLoRA:
	"""Tests for delete_lora function."""

	def test_delete_lora_removes_record(self):
		"""Test that delete_lora removes LoRA from database."""
		# Arrange
		mock_db = MagicMock(spec=Session)
		mock_query = MagicMock()
		mock_db.query.return_value = mock_query

		mock_filter = MagicMock()
		mock_query.filter.return_value = mock_filter

		mock_lora = MagicMock()
		mock_lora.id = 5
		mock_lora.file_path = '/cache/loras/to_delete.safetensors'
		mock_filter.first.return_value = mock_lora

		# Act
		result = database_service.delete_lora(mock_db, 5)

		# Assert
		assert result == '/cache/loras/to_delete.safetensors'
		mock_db.query.assert_called_once_with(LoRA)
		mock_db.delete.assert_called_once_with(mock_lora)
		mock_db.commit.assert_called_once()

	def test_delete_lora_raises_when_not_found(self):
		"""Test delete_lora raises ValueError when LoRA doesn't exist."""
		# Arrange
		mock_db = MagicMock(spec=Session)
		mock_query = MagicMock()
		mock_db.query.return_value = mock_query

		mock_filter = MagicMock()
		mock_query.filter.return_value = mock_filter
		mock_filter.first.return_value = None

		# Act & Assert
		try:
			database_service.delete_lora(mock_db, 999)
			assert False, 'Should have raised ValueError'
		except ValueError as error:
			assert 'LoRA with id 999 does not exist' in str(error)

		mock_db.delete.assert_not_called()
		mock_db.commit.assert_not_called()
