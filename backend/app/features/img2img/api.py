"""Image-to-Image Generation Router"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import database_service
from app.database.crud import add_generated_image
from app.schemas.img2img import Img2ImgRequest
from app.services import logger_service

from .service import img2img_service

logger = logger_service.get_logger(__name__, category='API')
img2img = APIRouter(
	prefix='/img2img',
	tags=['img2img'],
)


@img2img.post('/')
async def generate_image_from_image(
	request: Img2ImgRequest,
	db: Session = Depends(database_service.get_db),
):
	"""
	Generate images from an uploaded source image using img2img.

	Request body:
	- history_id: History entry ID for tracking
	- config: Img2img configuration (includes base64 image, prompt, strength, etc.)

	Returns:
	- ImageGenerationResponse with generated images
	"""
	try:
		config = request.config
		history_id = request.history_id

		response = await img2img_service.generate_image_from_image(config, db)

		add_generated_image(db, history_id, response)

		return response

	except ValueError as error:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))
