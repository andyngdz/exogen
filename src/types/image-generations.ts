import {
  GeneratorConfigFormValues,
  GeneratorImage2ImageConfigFormValues
} from '@/features/generator-configs'

interface ImageGenerationRequest {
  history_id: number
  config: GeneratorConfigFormValues
}

interface Image2ImageGenerationRequest {
  history_id: number
  config: GeneratorImage2ImageConfigFormValues
}

interface ImageGenerationItem {
  path: string
  file_name: string
}

interface ImageGenerationResponse {
  items: ImageGenerationItem[]
  nsfw_content_detected: boolean[]
}

interface ImageGenerationStepEndResponse {
  index: number
  current_step: number
  timestep: number
  image_base64: string
}

export type {
  ImageGenerationItem,
  ImageGenerationRequest,
  Image2ImageGenerationRequest,
  ImageGenerationResponse,
  ImageGenerationStepEndResponse
}
