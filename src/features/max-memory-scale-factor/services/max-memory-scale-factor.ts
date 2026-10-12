import { MemoryScaleFactorColor } from '@/features/max-memory-scale-factor/types'

class MaxMemoryScaleFactorService {
  color(scaleFactor: number): MemoryScaleFactorColor {
    if (scaleFactor <= 0.5) {
      return MemoryScaleFactorColor.SUCCESS
    } else if (scaleFactor <= 0.7) {
      return MemoryScaleFactorColor.WARNING
    } else {
      return MemoryScaleFactorColor.DANGER
    }
  }
}

export const maxMemoryScaleFactorService = new MaxMemoryScaleFactorService()
