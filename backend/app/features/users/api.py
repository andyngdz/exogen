"""Users Router"""

from urllib.parse import quote

import requests
from fastapi import APIRouter
from fastapi.responses import FileResponse, Response

from app.constants.users import HUGGINGFACE_API_BASE, PLACEHOLDER_IMAGE_PATH

from .service import user_service

users = APIRouter(
	prefix='/users',
	tags=['users'],
)


@users.get('/avatar/{user_id}.png')
def get_user_avatar(user_id: str):
	"""Proxy and serve the Hugging Face user avatar"""
	if not user_service.is_valid_user_id(user_id):
		return FileResponse(PLACEHOLDER_IMAGE_PATH)

	safe_user_id = quote(user_id, safe='')

	try:
		response = requests.get(f'{HUGGINGFACE_API_BASE}/users/{safe_user_id}/avatar', timeout=5)
		if response.status_code == 404:
			response = requests.get(f'{HUGGINGFACE_API_BASE}/organizations/{safe_user_id}/avatar', timeout=5)

		response.raise_for_status()

		avatar_url = response.json().get('avatarUrl')

		if not avatar_url or avatar_url.endswith('.svg'):
			return FileResponse(PLACEHOLDER_IMAGE_PATH)

		avatar_image_response = requests.get(avatar_url, timeout=5)
		avatar_image_response.raise_for_status()

		return Response(content=avatar_image_response.content, media_type='image/png')

	except requests.RequestException:
		return FileResponse(PLACEHOLDER_IMAGE_PATH)
