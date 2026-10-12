from app.schemas.styles import StyleItem

action_styles = [
	StyleItem(
		id='action_figure',
		name='Action Figure',
		origin='Fooocus',
		positive='Action Figure, {prompt}, plastic collectable action figure, collectable toy action figure',
		negative='ugly, deformed, noisy, blurry, low contrast',
		image='styles/action/figure.jpg',
	),
]
