import { UpscaleFactor, UpscalerType } from '@/cores/constants'

export const UPSCALE_FACTORS = [
  { value: UpscaleFactor.ONE_POINT_FIVE, label: '1.5x' },
  { value: UpscaleFactor.TWO, label: '2x' },
  { value: UpscaleFactor.THREE, label: '3x' },
  { value: UpscaleFactor.FOUR, label: '4x' }
]

export const UPSCALERS = [
  { value: UpscalerType.LANCZOS, label: 'Lanczos (Highest Quality)' },
  { value: UpscalerType.BICUBIC, label: 'Bicubic (High Quality)' },
  { value: UpscalerType.BILINEAR, label: 'Bilinear (Balanced)' },
  { value: UpscalerType.NEAREST, label: 'Nearest (Fastest)' }
]
