"""Styles Router"""

from fastapi import APIRouter

from app.constants.styles import all_styles, sections
from app.schemas.styles import StyleSectionResponse
from app.services import styles_service

styles = APIRouter(
	prefix='/styles',
	tags=['styles'],
)


@styles.get('/')
def get_styles():
	"""List all styles"""
	# all_styles is a mapping: section_id -> list[StyleItem]
	return [
		StyleSectionResponse(
			id=section_id,
			name=sections.get(section_id, section_id.capitalize()),
			styles=styles,
		)
		for section_id, styles in all_styles.items()
		if styles
	]


@styles.get('/prompt')
def get_prompt_styles(user_prompt: str):
	return styles_service.apply_styles(user_prompt, '', ['fooocus_v2', 'fooocus_enhance', 'fooocus_sharp'])
