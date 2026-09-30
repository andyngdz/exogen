from app.schemas.styles import StyleItem

abstract_styles = [
	StyleItem(
		id='abstract_expressionism',
		name='Abstract Expressionism',
		origin='Fooocus',
		positive='Abstract Expressionism Art, {prompt}, High contrast, minimalistic, colorful, stark, dramatic, expressionism',
		negative='ugly, deformed, noisy, blurry, low contrast, realism, photorealistic',
		image='styles/abstract/expressionism.jpg',
	),
]
