from app.schemas.styles import StyleItem

sketchup_styles = [
	StyleItem(
		id='sketchup_sketchup',
		name='Sketchup',
		origin='Fooocus',
		positive='Sketchup, {prompt}, CAD, professional design, Sketchup',
		negative='ugly, deformed, noisy, blurry, low contrast, photo, photograph',
		image='styles/sketchup/sketchup.jpg',
	),
]
