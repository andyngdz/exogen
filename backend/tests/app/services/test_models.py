"""Tests for the model service."""

from unittest.mock import MagicMock, patch

from sqlalchemy.orm import Session

from app.database.models import Model
from app.services.models import ModelService


class TestModelService:
	"""Tests for the ModelService class."""

	def setup_method(self):
		"""Set up test fixtures before each test method."""
		self.mock_storage = MagicMock()
		self.model_service = ModelService()
		self.model_service.storage = self.mock_storage
		self.mock_db = MagicMock(spec=Session)

	def test_add_model(self):
		"""Test add_model method."""
		# Arrange
		model_id = 'test/model'
		model_dir = '/path/to/model'

		# Set up mock database to simulate no existing model
		self.mock_db.query.return_value.filter.return_value.first.return_value = None

		# Act
		result = self.model_service.add_model(self.mock_db, model_id, model_dir)

		# Assert
		assert result.model_id == model_id
		assert result.model_dir == model_dir
		self.mock_db.query.assert_called_once_with(Model)
		self.mock_db.add.assert_called_once()
		self.mock_db.commit.assert_called_once()

	def test_get_downloaded_models(self):
		"""Test get_downloaded_models method."""
		# Arrange
		mock_models = [MagicMock(), MagicMock()]
		self.mock_db.query.return_value.all.return_value = mock_models

		# Act
		result = self.model_service.get_downloaded_models(self.mock_db)

		# Assert
		assert result == mock_models
		self.mock_db.query.assert_called_once_with(Model)
		self.mock_db.query.return_value.all.assert_called_once()

	def test_is_model_downloaded(self):
		"""Test is_model_downloaded method."""
		# Arrange
		model_id = 'test/model'
		mock_model = MagicMock()
		self.mock_db.query.return_value.filter.return_value.first.return_value = mock_model

		# Act
		result = self.model_service.is_model_downloaded(self.mock_db, model_id)

		# Assert
		assert result is True
		self.mock_db.query.assert_called_once_with(Model)
		self.mock_db.query.return_value.filter.assert_called_once()
		self.mock_db.query.return_value.filter.return_value.first.assert_called_once()

	def test_delete_model_success(self):
		"""Test delete_model method when successful."""
		# Arrange
		model_id = 'test/model'
		mock_model = MagicMock()
		self.mock_db.query.return_value.filter.return_value.first.return_value = mock_model

		model_dir = '/path/to/model'
		lock_dir = '/path/to/lock'
		self.mock_storage.get_model_dir.return_value = model_dir
		self.mock_storage.get_model_lock_dir.return_value = lock_dir

		# Mock os.path.exists to return True for both directories
		with patch('os.path.exists', side_effect=[True, True]), patch('shutil.rmtree') as mock_rmtree:
			# Act
			result = self.model_service.delete_model(self.mock_db, model_id)

			# Assert
			assert result == model_id
			self.mock_db.query.assert_called_once_with(Model)
			self.mock_db.query.return_value.filter.assert_called_once()
			self.mock_storage.get_model_dir.assert_called_once_with(model_id)
			self.mock_storage.get_model_lock_dir.assert_called_once_with(model_id)
			assert mock_rmtree.call_count == 2
			self.mock_db.delete.assert_called_once_with(mock_model)
			self.mock_db.commit.assert_called_once()

	def test_delete_model_nonexistent(self):
		"""Test delete_model method when model doesn't exist."""
		# Arrange
		model_id = 'test/model'
		self.mock_db.query.return_value.filter.return_value.first.return_value = None

		# Act & Assert
		try:
			self.model_service.delete_model(self.mock_db, model_id)
			assert False, 'Expected ValueError was not raised'
		except ValueError as e:
			assert str(e) == f'Model with id {model_id} does not exist.'

		self.mock_db.query.assert_called_once_with(Model)
		self.mock_db.query.return_value.filter.assert_called_once()
		self.mock_db.delete.assert_not_called()
		self.mock_db.commit.assert_not_called()

	def test_delete_model_no_directories(self):
		"""Test delete_model method when directories don't exist."""
		# Arrange
		model_id = 'test/model'
		mock_model = MagicMock()
		self.mock_db.query.return_value.filter.return_value.first.return_value = mock_model

		model_dir = '/path/to/model'
		lock_dir = '/path/to/lock'
		self.mock_storage.get_model_dir.return_value = model_dir
		self.mock_storage.get_model_lock_dir.return_value = lock_dir

		# Mock os.path.exists to return False for both directories
		with patch('os.path.exists', side_effect=[False, False]), patch('shutil.rmtree') as mock_rmtree:
			# Act
			result = self.model_service.delete_model(self.mock_db, model_id)

			# Assert
			assert result == model_id
			self.mock_storage.get_model_dir.assert_called_once_with(model_id)
			self.mock_storage.get_model_lock_dir.assert_called_once_with(model_id)
			mock_rmtree.assert_not_called()
			self.mock_db.delete.assert_called_once_with(mock_model)
			self.mock_db.commit.assert_called_once()

	def test_delete_model_exception(self):
		"""Test delete_model method when an exception occurs."""
		# Arrange
		model_id = 'test/model'
		mock_model = MagicMock()
		self.mock_db.query.return_value.filter.return_value.first.return_value = mock_model

		model_dir = '/path/to/model'
		self.mock_storage.get_model_dir.return_value = model_dir

		# Mock os.path.exists to return True
		with (
			patch('os.path.exists', return_value=True),
			patch('shutil.rmtree', side_effect=Exception('Filesystem error')),
		):
			# Act & Assert
			try:
				self.model_service.delete_model(self.mock_db, model_id)
				assert False, 'Expected ValueError was not raised'
			except ValueError as e:
				assert str(e) == 'Error deleting model: Filesystem error'

			self.mock_db.rollback.assert_called_once()
			self.mock_db.commit.assert_not_called()
