from app.schemas.styles import StyleItem

art_styles = [
	StyleItem(
		id='art_deco',
		name='Art Deco',
		origin='Fooocus',
		positive='Art Deco, {prompt}, sleek, geometric forms, art deco style',
		negative='ugly, deformed, noisy, blurry, low contrast',
		image='styles/art/deco.jpg',
	),
	StyleItem(
		id='art_nouveau',
		name='Art Nouveau',
		origin='Fooocus',
		positive='Art Nouveau, beautiful art, {prompt}, sleek, organic forms, long, sinuous, art nouveau style',
		negative='ugly, deformed, noisy, blurry, low contrast, industrial, mechanical',
		image='styles/art/nouveau.jpg',
	),
]
