import { DEFAULT_BACKEND_URL } from '@/cores/constants'
import { GeneratorConfigFormValues } from '@/features/generator-configs'
import axios from 'axios'
import type {
  BackendConfig,
  HardwareResponse,
  HealthResponse,
  HistoryItem,
  Image2ImageGenerationRequest,
  ImageGenerationRequest,
  ImageGenerationResponse,
  LoadModelRequest,
  LoRA,
  LoRADeleteResponse,
  LoRAListResponse,
  MaxMemoryRequest,
  ModelDetailsResponse,
  ModelDownloaded,
  ModelRecommendationResponse,
  ModelSearchResponse,
  Sampler,
  SelectDeviceRequest,
  StyleSection
} from '../types'

export const client = axios.create({
  baseURL: DEFAULT_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

class API {
  async health() {
    const { data } = await client.get<HealthResponse>('/')

    return data
  }

  async getHardwareStatus() {
    const { data } = await client.get<HardwareResponse>('/hardware/')

    return data
  }

  async setMaxMemory(request: MaxMemoryRequest) {
    const { data } = await client.put<BackendConfig>(
      '/config/max-memory',
      request
    )

    return data
  }

  async selectDevice(request: SelectDeviceRequest) {
    const { data } = await client.put<BackendConfig>('/config/device', request)

    return data
  }

  async getModelRecommendations() {
    const { data } = await client.get<ModelRecommendationResponse>(
      '/models/recommendations'
    )

    return data
  }

  async loadModel(request: LoadModelRequest) {
    const { data } = await client.post('/models/load', request)

    return data
  }

  async unloadModel() {
    const { data } = await client.post('/models/unload')

    return data
  }

  async searchModel(model_name: string) {
    const { data } = await client.get<ModelSearchResponse>(
      `/models/search?model_name=${model_name}`
    )

    return data
  }

  async modelDetails(model_id: string) {
    const { data } = await client.get<ModelDetailsResponse>(
      `/models/details?model_id=${model_id}`
    )

    return data
  }

  async downloadModel(model_id: string) {
    await client.post('/downloads/', { model_id })
  }

  async getDownloadedModels() {
    const { data } = await client.get<ModelDownloaded[]>('/models/downloaded')

    return data
  }

  async addHistory(config: GeneratorConfigFormValues) {
    const { data } = await client.post<number>('/histories', config)

    return data
  }

  async generator(request: ImageGenerationRequest) {
    const { data } = await client.post<ImageGenerationResponse>(
      `/generators`,
      request
    )

    return data
  }

  async img2img(request: Image2ImageGenerationRequest) {
    const { data } = await client.post<ImageGenerationResponse>(
      '/img2img',
      request
    )

    return data
  }

  async styles() {
    const { data } = await client.get<StyleSection[]>('/styles')

    return data
  }

  async getHistories() {
    const { data } = await client.get<HistoryItem[]>('/histories')

    return data
  }

  async deleteHistory(history_id: number) {
    const { data } = await client.delete(`/histories/${history_id}`)

    return data
  }

  async deleteModel(model_id: string) {
    const { data } = await client.delete(`/models?model_id=${model_id}`)

    return data
  }

  async getSamplers() {
    const { data } = await client.get<Sampler[]>('/generators/samplers')

    return data
  }

  async loras() {
    const { data } = await client.get<LoRAListResponse>('/loras')

    return data
  }

  async uploadLora(file_path: string) {
    const { data } = await client.post<LoRA>('/loras/upload', { file_path })

    return data
  }

  async deleteLora(id: number) {
    const { data } = await client.delete<LoRADeleteResponse>(`/loras/${id}`)

    return data
  }

  async getConfig() {
    const { data } = await client.get<BackendConfig>('/config/')

    return data
  }

  async setSafetyCheckEnabled(enabled: boolean) {
    await client.put('/config/safety-check', { enabled })
  }
}

export const api = new API()
