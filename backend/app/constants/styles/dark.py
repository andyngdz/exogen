from app.schemas.styles import StyleItem

dark_styles = [
	StyleItem(
		id='dark_fantasy',
		name='Dark Fantasy',
		origin='Fooocus',
		positive='Dark Fantasy Art, {prompt}, dark, moody, dark fantasy style',
		negative='ugly, deformed, noisy, blurry, low contrast, bright, sunny',
		image='styles/dark/fantasy.jpg',
	),
	StyleItem(
		id='dark_moody-atmosphere',
		name='Dark Moody Atmosphere',
		origin='Fooocus',
		positive='Dark Moody Atmosphere, {prompt}, dramatic, mysterious, dark moody atmosphere',
		negative='ugly, deformed, noisy, blurry, low contrast, vibrant, colorful, bright',
		image='styles/dark/moody-atmosphere.jpg',
	),
]
