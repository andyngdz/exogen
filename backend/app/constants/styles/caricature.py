from app.schemas.styles import StyleItem

caricature_styles = [
	StyleItem(
		id='caricature_caricature',
		name='Caricature',
		origin='Fooocus',
		positive='Caricature, {prompt}, exaggerated, comical, caricature',
		negative='ugly, deformed, noisy, blurry, low contrast, realistic',
		image='styles/caricature/caricature.jpg',
	),
]
