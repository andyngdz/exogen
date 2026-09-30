""" "Image Generation Router"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.cores.samplers import samplers_service
from app.database import database_service
from app.database.crud import add_generated_image
from app.schemas.generators import ImageGenerationRequest
from app.services import logger_service

from .service import generator_service

logger = logger_service.get_logger(__name__, category='Generate')
generators = APIRouter(
	prefix='/generators',
	tags=['generators'],
)


@generators.post('/')
async def generation_image(
	request: ImageGenerationRequest,
	db: Session = Depends(database_service.get_db),
):
	"""
	Generates an image based on the provided prompt and parameters.
	Returns the first generated image as a file.
	"""
	try:
		config = request.config
		history_id = request.history_id

		response = await generator_service.generate_image(config, db)

		add_generated_image(db, history_id, response)

		return response

	except ValueError as error:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))


@generators.get('/samplers')
async def all_samplers():
	"""
	Returns a list of available samplers for image generation.
	"""

	return samplers_service.samplers
