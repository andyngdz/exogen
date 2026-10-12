"""Constants for image upscaling."""

from app.schemas.hires_fix import RemoteModel, UpscalerType

PIL_UPSCALERS = {
	UpscalerType.LANCZOS,
	UpscalerType.BICUBIC,
	UpscalerType.BILINEAR,
	UpscalerType.NEAREST,
}

REALESRGAN_UPSCALERS = {
	UpscalerType.REALESRGAN_X2PLUS,
	UpscalerType.REALESRGAN_X4PLUS,
	UpscalerType.REALESRGAN_X4PLUS_ANIME,
}

REALESRGAN_MODELS: dict[UpscalerType, RemoteModel] = {
	UpscalerType.REALESRGAN_X2PLUS: RemoteModel(
		url='https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth',
		filename='RealESRGAN_x2plus.pth',
		scale=2,
	),
	UpscalerType.REALESRGAN_X4PLUS: RemoteModel(
		url='https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth',
		filename='RealESRGAN_x4plus.pth',
		scale=4,
	),
	UpscalerType.REALESRGAN_X4PLUS_ANIME: RemoteModel(
		url='https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth',
		filename='RealESRGAN_x4plus_anime_6B.pth',
		scale=4,
	),
}
