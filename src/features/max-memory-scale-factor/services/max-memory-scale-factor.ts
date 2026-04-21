import { SliderProps } from '@heroui/react'

class MaxMemoryScaleFactorService {
  color(scaleFactor: number): SliderProps['color'] {
    if (scaleFactor <= 0.5) {
      return 'success'
    } else if (scaleFactor <= 0.7) {
      return 'warning'
    } else {
      return 'danger'
    }
  }
}

export const maxMemoryScaleFactorService = new MaxMemoryScaleFactorService()
