from app.schemas.styles import StyleItem

doodle_styles = [
	StyleItem(
		id='doodle_art',
		name='Doodle Art',
		origin='Fooocus',
		positive='Doodle Art Style, {prompt}, drawing, freeform, swirling patterns, doodle art style',
		negative='ugly, deformed, noisy, blurry, low contrast',
		image='styles/doodle/art.jpg',
	),
]
