from app.schemas.styles import StyleItem

conceptual_styles = [
	StyleItem(
		id='conceptual_art',
		name='Conceptual Art',
		origin='Fooocus',
		positive='Conceptual Art, {prompt}, concept art',
		negative='ugly, deformed, noisy, blurry, low contrast',
		image='styles/conceptual/art.jpg',
	),
]
