from app.schemas.styles import StyleItem

color_styles = [
	StyleItem(
		id='color_field-painting',
		name='Color Field Painting',
		origin='Fooocus',
		positive='Color Field Painting, {prompt}, abstract, simple, geometic, color field painting style',
		negative='ugly, deformed, noisy, blurry, low contrast',
		image='styles/color/field-painting.jpg',
	),
]
