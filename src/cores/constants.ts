export class DeviceSelection {
  static readonly NOT_FOUND = -2
}

export const DEFAULT_BACKEND_PORT = 8000
export const DEFAULT_BACKEND_URL = 'http://localhost:8000'

export enum UpscalerMethod {
  TRADITIONAL = 'traditional',
  AI = 'ai'
}

export enum UpscalerType {
  LANCZOS = 'Lanczos',
  BICUBIC = 'Bicubic',
  BILINEAR = 'Bilinear',
  NEAREST = 'Nearest',
  REAL_ESRGAN_X2_PLUS = 'RealESRGAN_x2plus',
  REAL_ESRGAN_X4_PLUS = 'RealESRGAN_x4plus',
  REAL_ESRGAN_X4_PLUS_ANIME = 'RealESRGAN_x4plus_anime'
}

export enum UpscaleFactor {
  ONE_POINT_FIVE = 1.5,
  TWO = 2,
  THREE = 3,
  FOUR = 4
}
