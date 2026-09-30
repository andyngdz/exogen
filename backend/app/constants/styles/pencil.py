from app.schemas.styles import StyleItem

pencil_styles = [
	StyleItem(
		id='pencil_sketch-drawing',
		name='Pencil Sketch Drawing',
		origin='Fooocus',
		positive='Pencil Sketch Drawing, {prompt}, black and white drawing, graphite drawing',
		negative='ugly, deformed, noisy, blurry, low contrast',
		image='styles/pencil/sketch-drawing.jpg',
	),
]
