from app.schemas.styles import StyleItem

character_styles = [
	StyleItem(
		id='character_design-sheet',
		name='Character Design Sheet',
		origin='Fooocus',
		positive='Character Design Sheet, {prompt}, character reference sheet, character turn around',
		negative='ugly, deformed, noisy, blurry, low contrast',
		image='styles/character/design-sheet.jpg',
	),
]
