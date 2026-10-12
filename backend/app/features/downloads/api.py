from asyncio import CancelledError

from aiohttp import ClientError
from fastapi import APIRouter, Depends, HTTPException, status
from huggingface_hub import HfApi
from sqlalchemy.orm import Session
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_fixed

from app.database import database_service
from app.schemas.downloads import (
	DownloadModelRequest,
	DownloadModelResponse,
	DownloadModelStartResponse,
)
from app.services import logger_service
from app.socket import socket_service

from .services import download_service

logger = logger_service.get_logger(__name__, category='Download')
downloads = APIRouter(
	prefix='/downloads',
	tags=['downloads'],
)
api = HfApi()


@downloads.post('/')
@retry(
	stop=stop_after_attempt(5),
	wait=wait_fixed(2),
	retry=retry_if_exception_type((TimeoutError, ClientError)),
)
async def download(
	request: DownloadModelRequest,
	db: Session = Depends(database_service.get_db),
):
	"""Initialize a download for the given model ID and save it to the database"""

	model_id = request.model_id

	logger.info(f'API Request: Initiating download for id: {model_id}')

	try:
		await socket_service.download_start(DownloadModelStartResponse(model_id=model_id))

		# Start the download process with database session for proper dependency injection
		local_dir = await download_service.start(model_id, db)

		if not local_dir:
			raise HTTPException(
				status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
				detail=f'Failed to download model {model_id}',
			)

		download_model_response = DownloadModelResponse(
			model_id=model_id,
			message='Download completed and saved to database',
			path=local_dir,
		)

		# Send completion notification
		await socket_service.download_completed(download_model_response)

		return download_model_response

	except CancelledError:
		logger.warning(f'Download task for id {model_id} was cancelled')
		raise
	except Exception:
		logger.error(f'Error downloading model {model_id}')
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f'Failed to download model {model_id}',
		)
	finally:
		logger.info(f'Download task for id {model_id} completed')
