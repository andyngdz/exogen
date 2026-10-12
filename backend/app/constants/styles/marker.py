from app.schemas.styles import StyleItem

marker_styles = [
	StyleItem(
		id='marker_drawing',
		name='Marker Drawing',
		origin='Fooocus',
		positive='Marker Drawing, {prompt}, bold marker lines, visibile paper texture, marker drawing',
		negative='ugly, deformed, noisy, blurry, low contrast, photograph, realistic',
		image='styles/marker/drawing.jpg',
	),
]
