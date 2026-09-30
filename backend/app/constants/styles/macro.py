from app.schemas.styles import StyleItem

macro_styles = [
	StyleItem(
		id='macro_photography',
		name='Macro Photography',
		origin='Fooocus',
		positive='Macro Photography, {prompt}, close-up, macro 100mm, macro photography',
		negative='ugly, deformed, noisy, blurry, low contrast',
		image='styles/macro/photography.jpg',
	),
]
