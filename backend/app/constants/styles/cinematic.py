from app.schemas.styles import StyleItem

cinematic_styles = [
	StyleItem(
		id='cinematic_diva',
		name='Cinematic Diva',
		origin='Fooocus',
		positive='UHD, 8K, ultra detailed, a cinematic photograph of {prompt}, beautiful lighting, great composition',
		negative='ugly, deformed, noisy, blurry, NSFW',
		image='styles/cinematic/diva.jpg',
	),
]
