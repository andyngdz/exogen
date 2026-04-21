interface LoadModelRequest {
  model_id: string
}

export enum ModelFamily {
  SD15 = 'sd15',
  SDXL = 'sdxl',
  SD2 = 'sd2',
  SD3 = 'sd3',
  FLUX = 'flux',
  UNKNOWN = 'unknown'
}

interface LoadModelResponse {
  model_id: string
  config: Record<string, unknown>
  sample_size: number
  family: ModelFamily
}

interface ModelSearchInfo {
  id: string
  author: string
  likes: number
  trending_score?: number
  downloads: number
  tags: string[]
  is_downloaded: boolean
  size_mb?: number
  description?: string
}

interface ModelSearchResponse {
  models_search_info: ModelSearchInfo[]
}

interface ModelDetailsSibling {
  blob_id: string
  rfilename: string
  size: number
}

interface ModelDetailsResponse {
  author: string
  created_at: string
  disabled: boolean
  downloads_all_time?: number
  downloads: number
  gated: string
  id: string
  last_modified: string
  library_name: string
  likes: number
  pipeline_tag: string[]
  private: boolean
  sha: string
  siblings: ModelDetailsSibling[]
  spaces: string[]
  tags: string[]
}

export type {
  LoadModelRequest,
  LoadModelResponse,
  ModelDetailsResponse,
  ModelDetailsSibling,
  ModelSearchInfo,
  ModelSearchResponse
}
