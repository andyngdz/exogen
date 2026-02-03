import { UpscaleFactor, UpscalerType } from '@/cores/constants'

export interface HiresFixConfig {
  upscale_factor: UpscaleFactor
  upscaler: UpscalerType
  denoising_strength: number
  steps: number
}

export enum GeneratorMode {
  TEXT_2_IMAGE = 'TEXT_2_IMAGE',
  IMAGE_2_IMAGE = 'IMAGE_2_IMAGE'
}

export enum Image2ImageResizeMode {
  RESIZE = 'resize',
  CROP = 'crop'
}
