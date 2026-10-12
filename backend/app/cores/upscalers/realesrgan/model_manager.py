"""Model management for Real-ESRGAN: download, cache, and load."""

from pathlib import Path

from basicsr.archs.rrdbnet_arch import RRDBNet
from pypdl import Pypdl
from realesrgan import RealESRGANer

from app.constants.upscalers import REALESRGAN_MODELS
from app.schemas.hires_fix import UpscalerType
from app.services import device_service, logger_service, storage_service

logger = logger_service.get_logger(__name__, category='Upscaler')


class RealESRGANModelManager:
	"""Handles downloading, caching, and loading Real-ESRGAN models."""

	def get_or_download(self, upscaler_type: UpscalerType) -> str:
		"""Download model if not cached, return local path."""
		remote_model = REALESRGAN_MODELS[upscaler_type]
		local_path = Path(storage_service.get_realesrgan_model_path(remote_model.filename))

		if local_path.exists():
			logger.info(f'Using cached model: {local_path}')
			return str(local_path)

		local_path.parent.mkdir(parents=True, exist_ok=True)

		logger.info(f'Downloading model from {remote_model.url}')

		downloader = Pypdl()
		downloader.start(remote_model.url, file_path=str(local_path), retries=3, etag_validation=True)

		logger.info(f'Model downloaded to: {local_path}')

		return str(local_path)

	def load(self, upscaler_type: UpscalerType) -> RealESRGANer:
		"""Load Real-ESRGAN model for the specified type."""
		remote_model = REALESRGAN_MODELS[upscaler_type]
		model_path = self.get_or_download(upscaler_type)
		device = device_service.torch_device
		half_precision = device_service.is_cuda

		logger.info(f'Loading Real-ESRGAN model on {device} (half={half_precision})')

		network_model = self._create_network(upscaler_type, remote_model.scale)
		return RealESRGANer(
			scale=remote_model.scale,
			model_path=model_path,
			model=network_model,
			tile=0,
			tile_pad=10,
			pre_pad=10,
			half=half_precision,
			device=device,
		)

	def _create_network(self, upscaler_type: UpscalerType, scale: int) -> RRDBNet:
		"""Create the appropriate network architecture for the model type."""
		if upscaler_type == UpscalerType.REALESRGAN_X4PLUS_ANIME:
			return RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=6, num_grow_ch=32, scale=scale)

		return RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=scale)


realesrgan_model_manager = RealESRGANModelManager()
