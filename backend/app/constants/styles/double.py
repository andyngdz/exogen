from app.schemas.styles import StyleItem

double_styles = [
	StyleItem(
		id='double_exposure',
		name='Double Exposure',
		origin='Fooocus',
		positive='Double Exposure Style, {prompt}, double image ghost effect, image combination, double exposure style',
		negative='ugly, deformed, noisy, blurry, low contrast',
		image='styles/double/exposure.jpg',
	),
]
