from app.schemas.styles import StyleItem

op_styles = [
	StyleItem(
		id='op_art',
		name='Op Art',
		origin='Fooocus',
		positive='Op Art, {prompt}, optical illusion, abstract, geometric pattern, impression of movement, Op Art',
		negative='ugly, deformed, noisy, blurry, low contrast',
		image='styles/op/art.jpg',
	),
]
