import type { HiresFixConfig } from './generators'
import type { LoRAConfigItem } from './loras'

interface HistoryGeneratorFormConfigValues {
  width: number
  height: number
  hires_fix?: HiresFixConfig
  loras: LoRAConfigItem[]
  number_of_images: number
  prompt: string
  negative_prompt: string
  cfg_scale: number
  clip_skip: number
  steps: number
  seed: number
  sampler: string
  styles: string[]
}

interface HistoryGeneratedImage {
  id: number
  path: string
  is_nsfw: boolean
  updated_at: string
  file_name: string
  history_id: number
  created_at: string
}

interface HistoryItem {
  model: string
  created_at: string
  prompt: string
  config: HistoryGeneratorFormConfigValues
  id: number
  updated_at: string
  generated_images: HistoryGeneratedImage[]
}

export type {
  HistoryGeneratedImage,
  HistoryGeneratorFormConfigValues,
  HistoryItem
}
