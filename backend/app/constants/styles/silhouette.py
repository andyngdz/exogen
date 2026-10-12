from app.schemas.styles import StyleItem

silhouette_styles = [
	StyleItem(
		id='silhouette_art',
		name='Silhouette Art',
		origin='Fooocus',
		positive='Silhouette Art, {prompt}, high contrast, well defined, Silhouette Art',
		negative='ugly, deformed, noisy, blurry, low contrast',
		image='styles/silhouette/art.jpg',
	),
]
