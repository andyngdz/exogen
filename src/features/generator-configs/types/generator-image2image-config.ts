import type { Image2ImageResizeMode } from '@/types'

import type { GeneratorConfigFormValues } from './generator-config'

export interface GeneratorImage2ImageConfigFormValues extends GeneratorConfigFormValues {
  init_image: string
  strength: number
  resize_mode: Image2ImageResizeMode
}
