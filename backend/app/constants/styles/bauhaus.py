from app.schemas.styles import StyleItem

bauhaus_styles = [
	StyleItem(
		id='bauhaus_style-poster',
		name='Bauhaus Style Poster',
		origin='Fooocus',
		positive='Bauhaus-Style Poster, {prompt}, simple geometric shapes, clean lines, primary colors, Bauhaus-Style Poster',
		negative='ugly, deformed, noisy, blurry, low contrast',
		image='styles/bauhaus/style-poster.jpg',
	),
]
