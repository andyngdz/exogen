"""Real-ESRGAN AI upscaler for high-quality image upscaling."""

from typing import Optional

from PIL import Image
from realesrgan import RealESRGANer

from app.constants.upscalers import REALESRGAN_MODELS
from app.cores.generation.image_processor import image_processor
from app.cores.upscalers.realesrgan.model_manager import realesrgan_model_manager
from app.cores.upscalers.realesrgan.resource_manager import realesrgan_resource_manager
from app.schemas.hires_fix import UpscalerType
from app.schemas.upscaler import UpscaleConfig
from app.services import logger_service

logger = logger_service.get_logger(__name__, category='Upscaler')


class RealESRGANUpscaler:
	"""AI upscaler using Real-ESRGAN models. Loads per-request and unloads after."""

	def __init__(self) -> None:
		self._model: Optional[RealESRGANer] = None

	def upscale(
		self,
		images: list[Image.Image],
		upscaler_type: UpscalerType,
		target_scale: float,
	) -> list[Image.Image]:
		"""Upscale images using Real-ESRGAN."""
		if not images:
			return []

		remote_model = REALESRGAN_MODELS[upscaler_type]
		original_width, original_height = images[0].size
		config = UpscaleConfig(
			batch_size=len(images),
			original_size=f'{original_width}x{original_height}',
			upscaler=upscaler_type.value,
			native_scale=remote_model.scale,
			target_scale=target_scale,
		)
		logger.info(f'AI upscaling\n{logger_service.format_config(config)}')

		try:
			self._model = realesrgan_model_manager.load(upscaler_type)
			upscaled = self._upscale_images(images)
			upscaled = self._resize_to_target_scale(
				upscaled,
				original_width,
				original_height,
				target_scale,
				remote_model.scale,
			)
			return upscaled
		finally:
			realesrgan_resource_manager.cleanup(self._model)
			self._model = None

	def _upscale_images(self, images: list[Image.Image]) -> list[Image.Image]:
		"""Upscale images using the loaded model."""
		if self._model is None:
			raise RuntimeError('Model not loaded')

		upscaled_images: list[Image.Image] = []

		for image in images:
			numpy_image = image_processor.pil_to_bgr_numpy(image)
			upscaled_numpy, _img_mode = self._model.enhance(numpy_image, outscale=self._model.scale)
			upscaled_pil = image_processor.bgr_numpy_to_pil(upscaled_numpy)
			upscaled_images.append(upscaled_pil)

		return upscaled_images

	def _resize_to_target_scale(
		self,
		images: list[Image.Image],
		original_width: int,
		original_height: int,
		target_scale: float,
		native_scale: int,
	) -> list[Image.Image]:
		"""Resize images to match target scale if different from native scale."""
		if target_scale == native_scale:
			return images

		target_width = int(original_width * target_scale)
		target_height = int(original_height * target_scale)
		logger.info(f'Resizing from native {native_scale}x to target {target_scale}x ({target_width}x{target_height})')

		resized = [img.resize((target_width, target_height), Image.Resampling.LANCZOS) for img in images]

		return resized


realesrgan_upscaler = RealESRGANUpscaler()
