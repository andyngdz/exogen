from typing import Optional

from diffusers.pipelines.auto_pipeline import AutoPipelineForImage2Image, AutoPipelineForText2Image

from app.schemas.model_loader import DiffusersPipeline
from app.services import logger_service

logger = logger_service.get_logger(__name__, category='ModelLoad')


class PipelineConverter:
	"""
	Service for converting between different diffusion pipeline types.

	Handles conversion between text-to-image, image-to-image, inpainting,
	and other pipeline modes while reusing loaded model components.
	"""

	def convert_to_img2img(self, pipe: Optional[DiffusersPipeline]) -> AutoPipelineForImage2Image:
		"""
		Convert pipeline to image-to-image mode.

		Args:
			pipe: Current pipeline instance

		Returns:
			Converted img2img pipeline

		Raises:
			ValueError: If pipe is None
		"""
		from diffusers.pipelines.auto_pipeline import AutoPipelineForImage2Image

		if pipe is None:
			raise ValueError('Pipeline is None. Cannot convert.')

		logger.info('Converting pipeline to img2img mode')

		# Check if already in img2img mode using type checking
		if isinstance(pipe, AutoPipelineForImage2Image):
			logger.info('Pipeline is already in img2img mode.')
			return pipe

		try:
			# Convert using from_pipe (efficient, reuses components)
			img2img_pipe = AutoPipelineForImage2Image.from_pipe(pipe)
			logger.info('Successfully converted to img2img pipeline.')
			return img2img_pipe
		except Exception as error:
			logger.error(f'Failed to convert to img2img pipeline: {error}')
			raise

	def convert_to_text2img(self, pipe: Optional[DiffusersPipeline]) -> AutoPipelineForText2Image:
		"""
		Convert pipeline to text-to-image mode.

		Args:
			pipe: Current pipeline instance

		Returns:
			Converted text2img pipeline

		Raises:
			ValueError: If pipe is None
		"""
		from diffusers.pipelines.auto_pipeline import AutoPipelineForText2Image

		if pipe is None:
			raise ValueError('Pipeline is None. Cannot convert.')

		logger.info('Converting pipeline to text2img mode')

		# Check if already in text2img mode using type checking
		if isinstance(pipe, AutoPipelineForText2Image):
			logger.info('Pipeline is already in text2img mode.')
			return pipe

		try:
			text2img_pipe = AutoPipelineForText2Image.from_pipe(pipe)
			logger.info('Successfully converted to text2img pipeline.')
			return text2img_pipe
		except Exception as error:
			logger.error(f'Failed to convert to text2img pipeline: {error}')
			raise

	def get_pipeline_type(self, pipe: Optional[DiffusersPipeline]) -> str:
		"""
		Detect the current pipeline type.

		Args:
			pipe: Pipeline instance

		Returns:
			Pipeline type: 'text2img', 'img2img', 'inpainting', or 'unknown'
		"""
		if pipe is None:
			return 'unknown'

		# Check for img2img (has 'image' parameter)
		if hasattr(pipe, 'image'):
			# Check for inpainting (has 'mask_image' parameter)
			if hasattr(pipe, 'mask_image'):
				return 'inpainting'
			return 'img2img'

		# Default to text2img
		return 'text2img'


pipeline_converter = PipelineConverter()
