from app.schemas.styles import StyleItem

neo_styles = [
	StyleItem(
		id='neo_baroque',
		name='Neo Baroque',
		origin='Fooocus',
		positive='Neo-Baroque, {prompt}, ornate and elaborate, dynamic, Neo-Baroque',
		negative='ugly, deformed, noisy, blurry, low contrast',
		image='styles/neo/baroque.jpg',
	),
	StyleItem(
		id='neo_byzantine',
		name='Neo Byzantine',
		origin='Fooocus',
		positive='Neo-Byzantine, {prompt}, grand decorative religious style, Orthodox Christian inspired, Neo-Byzantine',
		negative='ugly, deformed, noisy, blurry, low contrast',
		image='styles/neo/byzantine.jpg',
	),
	StyleItem(
		id='neo_futurism',
		name='Neo Futurism',
		origin='Fooocus',
		positive='Neo-Futurism, {prompt}, high-tech, curves, spirals, flowing lines, idealistic future, Neo-Futurism',
		negative='ugly, deformed, noisy, blurry, low contrast',
		image='styles/neo/futurism.jpg',
	),
	StyleItem(
		id='neo_impressionism',
		name='Neo Impressionism',
		origin='Fooocus',
		positive='Neo-Impressionism, {prompt}, tiny dabs of color, Pointillism, painterly, Neo-Impressionism',
		negative='ugly, deformed, noisy, blurry, low contrast, photograph, realistic',
		image='styles/neo/impressionism.jpg',
	),
	StyleItem(
		id='neo_rococo',
		name='Neo Rococo',
		origin='Fooocus',
		positive='Neo-Rococo, {prompt}, curved forms, naturalistic ornamentation, elaborate, decorative, gaudy, Neo-Rococo',
		negative='ugly, deformed, noisy, blurry, low contrast',
		image='styles/neo/rococo.jpg',
	),
]
