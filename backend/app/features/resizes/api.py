"""Image Resizing Router"""

import os
from io import BytesIO

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from PIL import Image

from app.services import logger_service
from config import STATIC_FOLDER

logger = logger_service.get_logger(__name__, category='API')

resizes = APIRouter(
	prefix='/resizes',
	tags=['resizes'],
)


@resizes.get('/image')
async def resized_image(
	file_path: str = Query(description='Path to the image file'),
	width: int = Query(..., ge=1, description='Width to resize the image to'),
	height: int = Query(..., ge=1, description='Height to resize the image to'),
):
	"""Serves images from the 'static' folder with resizing based on query parameters."""
	image_path = os.path.join(STATIC_FOLDER, file_path)

	if not os.path.exists(image_path):
		raise HTTPException(status_code=404, detail='Image not found')

	try:
		original_image = Image.open(image_path)

		resized_image = original_image.resize((width, height), Image.Resampling.LANCZOS)

		image_bytes_io = BytesIO()

		image_format = original_image.format or 'PNG'

		if image_format.upper() not in ['JPEG', 'PNG', 'GIF', 'WEBP']:
			image_format = 'PNG'

		resized_image.save(image_bytes_io, format=image_format)
		image_bytes_io.seek(0)

		media_type = f'image/{image_format.lower()}'

		return StreamingResponse(image_bytes_io, media_type=media_type)

	except Exception as error:
		logger.error(f'Error processing image {file_path}: {error}')
		raise HTTPException(status_code=500, detail='Error processing image')
