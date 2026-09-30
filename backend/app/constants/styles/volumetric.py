from app.schemas.styles import StyleItem

volumetric_styles = [
	StyleItem(
		id='volumetric_lighting',
		name='Volumetric Lighting',
		origin='Fooocus',
		positive='Volumetric Lighting, {prompt}, light depth, dramatic atmospheric lighting, Volumetric Lighting',
		negative='ugly, deformed, noisy, blurry, low contrast',
		image='styles/volumetric/lighting.jpg',
	),
]
