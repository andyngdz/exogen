from app.schemas.styles import StyleItem

infographic_styles = [
	StyleItem(
		id='infographic_drawing',
		name='Infographic Drawing',
		origin='Fooocus',
		positive='Infographic Drawing, {prompt}, diagram, infographic',
		negative='ugly, deformed, noisy, blurry, low contrast',
		image='styles/infographic/drawing.jpg',
	),
]
