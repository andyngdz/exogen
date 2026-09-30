"""Model management service - handles model database and filesystem operations."""

import os
import shutil
from typing import List

from sqlalchemy.orm import Session

from app.database.crud import add_model as db_add_model
from app.database.crud import downloaded_models as db_downloaded_models
from app.database.crud import is_model_downloaded as db_is_model_downloaded
from app.database.models import Model
from app.services.logger import logger_service
from app.services.storage import storage_service

logger = logger_service.get_logger(__name__, category='Service')


class ModelService:
	"""Service for managing model operations across database and filesystem."""

	def __init__(self):
		self.storage = storage_service

	def add_model(self, db: Session, model_id: str, model_dir: str):
		"""Add a model to the database."""
		return db_add_model(db, model_id, model_dir)

	def get_downloaded_models(self, db: Session) -> List[Model]:
		"""Get all downloaded models."""
		return db_downloaded_models(db)

	def is_model_downloaded(self, db: Session, model_id: str) -> bool:
		"""Check if model is downloaded."""
		return db_is_model_downloaded(db, model_id)

	def delete_model(self, db: Session, model_id: str) -> str:
		"""Delete a model from both database and filesystem."""
		# Get model from database
		model = db.query(Model).filter(Model.model_id == model_id).first()

		if not model:
			raise ValueError(f'Model with id {model_id} does not exist.')

		model_dir = self.storage.get_model_dir(model_id)

		try:
			# Delete the model directory and all its contents
			if os.path.exists(model_dir):
				logger.info(f'Deleting model directory: {model_dir}')
				shutil.rmtree(model_dir)

			# Delete the lock directory if it exists
			lock_dir = self.storage.get_model_lock_dir(model_id)
			if os.path.exists(lock_dir):
				logger.info(f'Deleting model lock directory: {lock_dir}')
				shutil.rmtree(lock_dir)

			# Delete from database
			db.delete(model)
			db.commit()

			logger.info(f'Successfully deleted model: {model_id}')
			return model_id

		except Exception as error:
			db.rollback()
			logger.error(f'Error deleting model {model_id}: {error}')
			raise ValueError(f'Error deleting model: {str(error)}')


# Singleton instance
model_service = ModelService()
