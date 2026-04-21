export interface LoRA {
  id: number
  name: string
  file_path: string
  file_size: number
  created_at: string
  updated_at: string
}

export interface LoRAConfigItem {
  lora_id: number
  weight: number
}

export interface LoRAListResponse {
  loras: LoRA[]
}

export interface LoRAUploadRequest {
  file_path: string
}

export interface LoRADeleteResponse {
  id: number
  message: string
}
