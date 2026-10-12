from app.schemas.styles import StyleItem

blueprint_styles = [
	StyleItem(
		id='blueprint_schematic-drawing',
		name='Blueprint Schematic Drawing',
		origin='Fooocus',
		positive='Blueprint Schematic Drawing, {prompt}, technical drawing, blueprint, schematic',
		negative='ugly, deformed, noisy, blurry, low contrast',
		image='styles/blueprint/schematic-drawing.jpg',
	),
]
