import base64
import io

from PIL import Image

from app.constants.img2img import IMG2IMG_RESIZE_MODES


class ImageService:
	def to_base64(self, image: Image.Image) -> str:
		"""
		Convert a PIL Image to a base64 encoded string.

		Args:
			image (Image): The PIL Image to convert.

		Returns:
			str: Base64 encoded string of the image.
		"""

		buffered = io.BytesIO()
		image.save(buffered, format='png')
		image_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

		return image_base64

	def from_base64(self, base64_string: str) -> Image.Image:
		"""
		Convert a base64 encoded string to a PIL Image.

		Args:
			base64_string (str): Base64 encoded image (with or without data URI prefix).

		Returns:
			Image.Image: PIL Image object.

		Raises:
			ValueError: If base64 string is invalid.
		"""
		try:
			# Remove data URI prefix if present (e.g., 'data:image/png;base64,')
			if ',' in base64_string:
				base64_string = base64_string.split(',', 1)[1]

			image_data = base64.b64decode(base64_string)
			# Annotate as Image.Image to handle ImageFile subclass from Image.open
			image: Image.Image = Image.open(io.BytesIO(image_data))

			# Convert to RGB to ensure compatibility
			if image.mode != 'RGB':
				image = image.convert('RGB')

			return image
		except Exception as error:
			raise ValueError(f'Failed to decode base64 image: {error}')

	def resize_image(self, image: Image.Image, width: int, height: int, mode: str = 'resize') -> Image.Image:
		"""
		Resize image to target dimensions.

		Args:
			image: Source PIL Image
			width: Target width
			height: Target height
			mode: 'resize' (stretch) or 'crop' (center crop)

		Returns:
			Resized PIL Image

		Raises:
			ValueError: If mode is not in supported modes
		"""
		# Validate mode against supported modes
		if mode not in IMG2IMG_RESIZE_MODES:
			raise ValueError(f'Invalid resize mode: {mode}. Supported modes: {IMG2IMG_RESIZE_MODES}')

		if mode == 'resize':
			# Simple resize (may change aspect ratio)
			return image.resize((width, height), Image.Resampling.LANCZOS)
		else:  # mode == 'crop'
			# Center crop to maintain aspect ratio
			aspect = width / height
			img_aspect = image.width / image.height

			if img_aspect > aspect:
				# Image is wider, crop width
				new_width = int(image.height * aspect)
				offset = (image.width - new_width) // 2
				image = image.crop((offset, 0, offset + new_width, image.height))
			else:
				# Image is taller, crop height
				new_height = int(image.width / aspect)
				offset = (image.height - new_height) // 2
				image = image.crop((0, offset, image.width, offset + new_height))

			return image.resize((width, height), Image.Resampling.LANCZOS)


image_service = ImageService()
