from app.schemas.styles import StyleItem

adorable_styles = [
	StyleItem(
		id='adorable_3d-character',
		name='Adorable 3D Character',
		origin='Fooocus',
		positive='Adorable 3D Character, {prompt}, 3D render, adorable character, 3D art',
		negative='ugly, deformed, noisy, blurry, low contrast, grunge, sloppy, unkempt, photograph, photo, realistic',
		image='styles/adorable/3d-character.jpg',
	),
	StyleItem(
		id='adorable_kawaii',
		name='Adorable Kawaii',
		origin='Fooocus',
		positive='Adorable Kawaii, {prompt}, pretty, cute, adorable, kawaii',
		negative='ugly, deformed, noisy, blurry, low contrast, gothic, dark, moody, monochromatic',
		image='styles/adorable/kawaii.jpg',
	),
]
