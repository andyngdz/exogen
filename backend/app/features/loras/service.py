"""LoRA business logic service."""

from pathlib import Path

from sqlalchemy.orm import Session

from app.database import crud as database_service
from app.database.models import LoRA
from app.features.loras.file_manager import lora_file_manager
from app.services.logger import logger_service

logger = logger_service.get_logger(__name__, category='Service')


class LoRAService:
	"""Service for managing LoRA operations."""

	def upload_lora(self, db: Session, file_path: str) -> LoRA:
		"""Upload a LoRA file from the local filesystem.

		Args:
			db: Database session
			file_path: Path to the LoRA file on the local filesystem

		Returns:
			Created LoRA database entry

		Raises:
			ValueError: If file validation fails or database operation fails
		"""
		# Validate the file
		is_valid, error_message = lora_file_manager.validate_file(file_path)
		if not is_valid:
			logger.error(f'LoRA file validation failed: {error_message}')
			raise ValueError(error_message)

		# Copy file to loras directory
		dest_path, filename, file_size = lora_file_manager.copy_file(file_path)

		# Extract display name from filename (without extension)
		name = Path(filename).stem

		# Check if LoRA with this file path already exists
		existing_lora = database_service.get_lora_by_file_path(db, dest_path)
		if existing_lora:
			logger.warning(f'LoRA already exists: {name} (id={existing_lora.id})')
			raise ValueError(f'LoRA already exists with this file path: {dest_path}')

		# Save to database
		try:
			lora = database_service.add_lora(db=db, name=name, file_path=dest_path, file_size=file_size)
			logger.info(f'Successfully uploaded LoRA: {name} (id={lora.id})')
			return lora
		except Exception as error:
			# If database fails, clean up the copied file
			lora_file_manager.delete_file(dest_path)
			logger.error(f'Failed to save LoRA to database: {error}')
			raise ValueError(f'Failed to save LoRA to database: {error}')

	def get_all_loras(self, db: Session) -> list[LoRA]:
		"""Get all LoRAs from the database.

		Args:
			db: Database session

		Returns:
			List of all LoRAs
		"""
		loras = database_service.get_all_loras(db)
		logger.debug(f'Retrieved {len(loras)} LoRAs from database')
		return loras

	def get_lora_by_id(self, db: Session, lora_id: int) -> LoRA:
		"""Get a LoRA by its database ID.

		Args:
			db: Database session
			lora_id: Database ID of the LoRA

		Returns:
			LoRA database entry

		Raises:
			ValueError: If LoRA is not found
		"""
		lora = database_service.get_lora_by_id(db, lora_id)
		if not lora:
			raise ValueError(f'LoRA with id {lora_id} not found')

		return lora

	def delete_lora(self, db: Session, lora_id: int) -> int:
		"""Delete a LoRA from the database and filesystem.

		Args:
			db: Database session
			lora_id: Database ID of the LoRA to delete

		Returns:
			ID of the deleted LoRA

		Raises:
			ValueError: If LoRA is not found
		"""
		# Delete from database (this also deletes the file)
		try:
			database_service.delete_lora(db, lora_id)
			logger.info(f'Successfully deleted LoRA id={lora_id}')
			return lora_id
		except ValueError as error:
			logger.error(f'Failed to delete LoRA: {error}')
			raise


lora_service = LoRAService()
