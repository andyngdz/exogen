import type { HiresFixConfig, LoRAConfigItem } from '@/types'

export interface GeneratorConfigFormValues {
  cfg_scale: number
  clip_skip: number
  height: number
  hires_fix?: HiresFixConfig
  loras: LoRAConfigItem[]
  negative_prompt: string
  number_of_images: number
  prompt: string
  sampler: string
  seed: number
  steps: number
  styles: string[]
  width: number
}
