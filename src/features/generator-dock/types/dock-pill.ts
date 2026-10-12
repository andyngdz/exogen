import type { GeneratorConfigFormValues } from '@/features/generator-configs'
import type { ImageSizePreset } from '@/features/generator-inspector/types'

export enum DockPillKind {
  SIZE = 'size',
  DENOISE = 'denoise',
  IMAGES = 'images',
  SAMPLING = 'sampling',
  SEED = 'seed',
  HIRES = 'hires',
  LORA = 'lora',
  STYLE = 'style'
}

export interface DockPill {
  key: string
  kind: DockPillKind
  label: string
}

export interface DockPillLora {
  name: string
  weight: number
}

export interface DockPillInput {
  values: Pick<
    GeneratorConfigFormValues,
    | 'width'
    | 'height'
    | 'number_of_images'
    | 'steps'
    | 'cfg_scale'
    | 'seed'
    | 'hires_fix'
  >
  sizePreset: ImageSizePreset
  samplerName: string
  isHiresFixEnabled: boolean
  isImageMode: boolean
  denoisingStrength: number
  loras: DockPillLora[]
  styleNames: string[]
}
