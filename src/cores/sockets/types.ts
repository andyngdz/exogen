interface DownloadStepProgressResponse {
  model_id: string
  step: number
  total: number
  downloaded_size: number
  total_downloaded_size: number
  phase: string
  current_file?: string
}
interface DownloadModelResponse {
  model_id: string
  message: string
  path: string
}

interface DownloadModelStartResponse {
  model_id: string
}

export enum ModelLoadPhase {
  INITIALIZATION = 'initialization',
  LOADING_MODEL = 'loading_model',
  DEVICE_SETUP = 'device_setup',
  OPTIMIZATION = 'optimization'
}

export interface ModelLoadProgressResponse {
  model_id: string
  step: number
  total: number
  phase: ModelLoadPhase
  message: string
}

export interface ModelLoadStartedResponse {
  model_id: string
}

export enum GenerationPhase {
  IMAGE_GENERATION = 'image_generation',
  UPSCALING = 'upscaling',
  COMPLETED = 'completed'
}

export interface GenerationPhaseResponse {
  phases: GenerationPhase[]
  current: GenerationPhase
}

export type {
  DownloadModelResponse,
  DownloadModelStartResponse,
  DownloadStepProgressResponse
}
