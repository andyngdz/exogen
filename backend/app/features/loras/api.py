"""LoRA API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.constants.error_messages import ERROR_INTERNAL_SERVER
from app.database import database_service
from app.features.loras.service import lora_service
from app.schemas.loras import (
	LoRADeleteResponse,
	LoRAInfo,
	LoRAListResponse,
	LoRAUploadRequest,
)
from app.services import logger_service

logger = logger_service.get_logger(__name__, category='API')

loras = APIRouter(
	prefix='/loras',
	tags=['loras'],
)


@loras.post('/upload', response_model=LoRAInfo, status_code=status.HTTP_201_CREATED)
def upload_lora(
	request: LoRAUploadRequest,
	db: Session = Depends(database_service.get_db),
):
	"""Upload a LoRA file from the local filesystem.

	Args:
		request: Upload request containing file path
		db: Database session

	Returns:
		Created LoRA information

	Raises:
		HTTPException: If file validation fails or upload fails
	"""
	try:
		logger.info(f'Uploading LoRA from: {request.file_path}')
		lora = lora_service.upload_lora(db, request.file_path)

		return LoRAInfo(
			id=lora.id,
			name=lora.name,
			file_path=lora.file_path,
			file_size=lora.file_size,
			created_at=lora.created_at,
			updated_at=lora.updated_at,
		)
	except ValueError as error:
		logger.error(f'Upload failed: {error}')
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))
	except Exception as error:
		logger.error(f'Unexpected error during upload: {error}')
		raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=ERROR_INTERNAL_SERVER)


@loras.get('/', response_model=LoRAListResponse)
def list_loras(
	db: Session = Depends(database_service.get_db),
):
	"""Get all available LoRAs.

	Args:
		db: Database session

	Returns:
		List of all LoRAs
	"""
	try:
		loras_list = lora_service.get_all_loras(db)

		return LoRAListResponse(
			loras=[
				LoRAInfo(
					id=lora.id,
					name=lora.name,
					file_path=lora.file_path,
					file_size=lora.file_size,
					created_at=lora.created_at,
					updated_at=lora.updated_at,
				)
				for lora in loras_list
			]
		)
	except Exception as error:
		logger.error(f'Failed to list LoRAs: {error}')
		raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=ERROR_INTERNAL_SERVER)


@loras.get('/{lora_id}', response_model=LoRAInfo)
def get_lora(
	lora_id: int,
	db: Session = Depends(database_service.get_db),
):
	"""Get a specific LoRA by ID.

	Args:
		lora_id: Database ID of the LoRA
		db: Database session

	Returns:
		LoRA information

	Raises:
		HTTPException: If LoRA is not found
	"""
	try:
		lora = lora_service.get_lora_by_id(db, lora_id)

		return LoRAInfo(
			id=lora.id,
			name=lora.name,
			file_path=lora.file_path,
			file_size=lora.file_size,
			created_at=lora.created_at,
			updated_at=lora.updated_at,
		)
	except ValueError as error:
		logger.error(f'LoRA not found: {error}')
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error))
	except Exception as error:
		logger.error(f'Failed to get LoRA: {error}')
		raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=ERROR_INTERNAL_SERVER)


@loras.delete('/{lora_id}', response_model=LoRADeleteResponse)
def delete_lora(
	lora_id: int,
	db: Session = Depends(database_service.get_db),
):
	"""Delete a LoRA by ID.

	Args:
		lora_id: Database ID of the LoRA to delete
		db: Database session

	Returns:
		Deletion confirmation

	Raises:
		HTTPException: If LoRA is not found
	"""
	try:
		lora_service.delete_lora(db, lora_id)
		logger.info(f'Deleted LoRA id={lora_id}')

		return LoRADeleteResponse(id=lora_id, message=f'LoRA {lora_id} deleted successfully')
	except ValueError as error:
		logger.error(f'LoRA deletion failed: {error}')
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error))
	except Exception as error:
		logger.error(f'Failed to delete LoRA: {error}')
		raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=ERROR_INTERNAL_SERVER)
