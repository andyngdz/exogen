from app.schemas.styles import StyleItem

cel_styles = [
	StyleItem(
		id='cel_shaded-art',
		name='Cel Shaded Art',
		origin='Fooocus',
		positive='Cel Shaded Art, {prompt}, 2D, flat color, toon shading, cel shaded style',
		negative='ugly, deformed, noisy, blurry, low contrast',
		image='styles/cel/shaded-art.jpg',
	),
]
