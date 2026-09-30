from app.schemas.styles import StyleItem

faded_styles = [
	StyleItem(
		id='faded_polaroid-photo',
		name='Faded Polaroid Photo',
		origin='Fooocus',
		positive='Faded Polaroid Photo, {prompt}, analog, old faded photo, old polaroid',
		negative='ugly, deformed, noisy, blurry, low contrast, vibrant, colorful',
		image='styles/faded/polaroid-photo.jpg',
	),
]
