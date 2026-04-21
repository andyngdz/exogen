import { UpscalerMethod } from '@/cores/constants'
import { api } from '@/services/api'
import type { BackendConfig, LoRA, LoRADeleteResponse } from '@/types'
import type { ModelDownloaded } from '@/types/api'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  useBackendConfigQuery,
  useDeleteLoraMutation,
  useDownloadedModelsQuery,
  useHardwareQuery,
  useHealthQuery,
  useHistoriesQuery,
  useLorasQuery,
  useModelRecommendationsQuery,
  useSafetyCheckMutation,
  useMaxMemoryMutation,
  useSamplersQuery,
  useStyleSectionsQuery,
  useUploadLoraMutation
} from '../queries'

// Mock the API service
vi.mock('@/services/api', () => ({
  api: {
    health: vi.fn(),
    getHardwareStatus: vi.fn(),
    getModelRecommendations: vi.fn(),
    getDownloadedModels: vi.fn(),
    styles: vi.fn(),
    getHistories: vi.fn(),
    getSamplers: vi.fn(),
    loras: vi.fn(),
    uploadLora: vi.fn(),
    deleteLora: vi.fn(),
    getConfig: vi.fn(),
    setSafetyCheckEnabled: vi.fn(),
    setMaxMemory: vi.fn()
  }
}))

/**
 * Creates a testing environment with a fresh QueryClient for React Query hooks
 */
const createQueryTestingEnvironment = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  })

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)

  return {
    queryClient,
    wrapper
  }
}

describe('React Query Hooks', () => {
  // Test utility setup
  let testEnv: ReturnType<typeof createQueryTestingEnvironment>

  beforeEach(() => {
    testEnv = createQueryTestingEnvironment()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    testEnv.queryClient.clear()
  })

  describe('useHealthQuery', () => {
    it('calls api.health and returns the data', async () => {
      const mockResponse = { status: 'ok', message: 'Server is healthy' }
      vi.mocked(api.health).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useHealthQuery(), {
        wrapper: testEnv.wrapper
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(api.health).toHaveBeenCalled()
      expect(result.current.data).toEqual(mockResponse)
    })

    it('handles error', async () => {
      const mockError = new Error('Network error')
      vi.mocked(api.health).mockRejectedValue(mockError)

      const { result } = renderHook(() => useHealthQuery(), {
        wrapper: testEnv.wrapper
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(api.health).toHaveBeenCalled()
    })
  })

  describe('useHardwareQuery', () => {
    it('calls api.getHardwareStatus and returns the data', async () => {
      const mockResponse = {
        is_cuda: true,
        cuda_runtime_version: '11.8',
        nvidia_driver_version: '520.61.05',
        gpus: [
          {
            name: 'NVIDIA GeForce RTX 3090',
            memory: 24576,
            cuda_compute_capability: '8.6',
            is_primary: true
          }
        ],
        message: 'CUDA is available'
      }
      vi.mocked(api.getHardwareStatus).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useHardwareQuery(), {
        wrapper: testEnv.wrapper
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(api.getHardwareStatus).toHaveBeenCalled()
      expect(result.current.data).toEqual(mockResponse)
    })

    it('handles error', async () => {
      const mockError = new Error('Network error')
      vi.mocked(api.getHardwareStatus).mockRejectedValue(mockError)

      const { result } = renderHook(() => useHardwareQuery(), {
        wrapper: testEnv.wrapper
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(api.getHardwareStatus).toHaveBeenCalled()
    })
  })

  describe('useModelRecommendationsQuery', () => {
    it('calls api.getModelRecommendations and returns the data', async () => {
      const mockResponse = {
        sections: [
          {
            id: 'section1',
            name: 'Section 1',
            description: 'Test section',
            models: [
              {
                id: 'model1',
                name: 'Model 1',
                description: 'Test model',
                memory_requirement_gb: 4,
                model_size: 'Medium',
                tags: ['tag1', 'tag2'],
                is_recommended: true
              }
            ],
            is_recommended: true
          }
        ],
        default_section: 'section1',
        default_selected_id: 'model1'
      }
      vi.mocked(api.getModelRecommendations).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useModelRecommendationsQuery(), {
        wrapper: testEnv.wrapper
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(api.getModelRecommendations).toHaveBeenCalled()
      expect(result.current.data).toEqual(mockResponse)
    })

    it('handles error', async () => {
      const mockError = new Error('Network error')
      vi.mocked(api.getModelRecommendations).mockRejectedValue(mockError)

      const { result } = renderHook(() => useModelRecommendationsQuery(), {
        wrapper: testEnv.wrapper
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(api.getModelRecommendations).toHaveBeenCalled()
    })
  })

  describe('useDownloadedModelsQuery', () => {
    it('calls api.getDownloadedModels and returns data', async () => {
      const mockResponse: ModelDownloaded[] = [
        {
          created_at: '2025-01-01T00:00:00Z',
          id: 1,
          model_id: 'model-1',
          model_dir: '/models/model-1',
          updated_at: '2025-01-01T00:00:00Z'
        },
        {
          created_at: '2025-01-02T00:00:00Z',
          id: 2,
          model_id: 'model-2',
          model_dir: '/models/model-2',
          updated_at: '2025-01-02T00:00:00Z'
        }
      ]
      vi.mocked(api.getDownloadedModels).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useDownloadedModelsQuery(), {
        wrapper: testEnv.wrapper
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(api.getDownloadedModels).toHaveBeenCalled()
      expect(result.current.data).toEqual(mockResponse)
    })

    it('handles error', async () => {
      const mockError = new Error('Network error')
      vi.mocked(api.getDownloadedModels).mockRejectedValue(mockError)

      const { result } = renderHook(() => useDownloadedModelsQuery(), {
        wrapper: testEnv.wrapper
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(api.getDownloadedModels).toHaveBeenCalled()
    })
  })

  describe('useStyleSectionsQuery', () => {
    it('calls api.styles and returns data', async () => {
      const mockResponse = [
        {
          id: 'section1',
          styles: [
            {
              id: 'style1',
              name: 'Style 1',
              origin: 'test',
              license: 'MIT',
              positive: 'beautiful, stunning',
              negative: 'ugly, blurry',
              image: 'style1.jpg'
            }
          ]
        }
      ]
      vi.mocked(api.styles).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useStyleSectionsQuery(), {
        wrapper: testEnv.wrapper
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(api.styles).toHaveBeenCalled()
      expect(result.current.data).toEqual(mockResponse)
    })

    it('handles error', async () => {
      const mockError = new Error('Network error')
      vi.mocked(api.styles).mockRejectedValue(mockError)

      const { result } = renderHook(() => useStyleSectionsQuery(), {
        wrapper: testEnv.wrapper
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(api.styles).toHaveBeenCalled()
    })
  })

  describe('useHistoriesQuery', () => {
    it('calls api.getHistories and returns data', async () => {
      const mockResponse = [
        {
          id: 1,
          model: 'stable-diffusion-xl',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:30:00Z',
          prompt: 'a beautiful landscape',
          config: {
            width: 1024,
            height: 1024,
            loras: [],
            number_of_images: 4,
            prompt: 'a beautiful landscape',
            negative_prompt: 'blurry, low quality',
            cfg_scale: 7.5,
            clip_skip: 2,
            steps: 30,
            seed: 12345,
            sampler: 'DPM++ 2M Karras',
            styles: ['photorealistic']
          },
          generated_images: [
            {
              id: 101,
              path: '/images/landscape1.png',
              file_name: 'landscape1.png',
              is_nsfw: false,
              history_id: 1,
              created_at: '2024-01-01T00:25:00Z',
              updated_at: '2024-01-01T00:25:00Z'
            },
            {
              id: 102,
              path: '/images/landscape2.png',
              file_name: 'landscape2.png',
              is_nsfw: false,
              history_id: 1,
              created_at: '2024-01-01T00:26:00Z',
              updated_at: '2024-01-01T00:26:00Z'
            }
          ]
        }
      ]
      vi.mocked(api.getHistories).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useHistoriesQuery(), {
        wrapper: testEnv.wrapper
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(api.getHistories).toHaveBeenCalled()
      expect(result.current.data).toEqual(mockResponse)
    })

    it('handles empty history list', async () => {
      const mockResponse: never[] = []
      vi.mocked(api.getHistories).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useHistoriesQuery(), {
        wrapper: testEnv.wrapper
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(api.getHistories).toHaveBeenCalled()
      expect(result.current.data).toEqual([])
    })

    it('handles error state', async () => {
      const mockError = new Error('Failed to fetch histories')
      vi.mocked(api.getHistories).mockRejectedValue(mockError)

      const { result } = renderHook(() => useHistoriesQuery(), {
        wrapper: testEnv.wrapper
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(api.getHistories).toHaveBeenCalled()
      expect(result.current.error).toBeDefined()
    })
  })

  describe('useSamplersQuery', () => {
    it('calls api.getSamplers and returns data', async () => {
      const mockResponse = [
        {
          name: 'Euler A',
          value: 'EULER_A',
          description: 'Fast, exploratory, slightly non-deterministic.'
        },
        {
          name: 'DDIM',
          value: 'DDIM',
          description: 'Deterministic, stable, and widely used.'
        }
      ]
      vi.mocked(api.getSamplers).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useSamplersQuery(), {
        wrapper: testEnv.wrapper
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(api.getSamplers).toHaveBeenCalled()
      expect(result.current.data).toEqual(mockResponse)
    })

    it('handles error', async () => {
      const mockError = new Error('Network error')
      vi.mocked(api.getSamplers).mockRejectedValue(mockError)

      const { result } = renderHook(() => useSamplersQuery(), {
        wrapper: testEnv.wrapper
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(api.getSamplers).toHaveBeenCalled()
    })
  })

  describe('useLorasQuery', () => {
    it('returns the lora list from api.loras', async () => {
      const mockResponse = {
        loras: [
          {
            id: 1,
            name: 'Test LoRA',
            file_path: '/loras/test.safetensors',
            file_size: 1024,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z'
          }
        ]
      }
      vi.mocked(api.loras).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useLorasQuery(), {
        wrapper: testEnv.wrapper
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(api.loras).toHaveBeenCalled()
      expect(result.current.data).toEqual(mockResponse.loras)
    })

    it('handles errors from api.loras', async () => {
      const mockError = new Error('Failed to fetch LoRAs')
      vi.mocked(api.loras).mockRejectedValue(mockError)

      const { result } = renderHook(() => useLorasQuery(), {
        wrapper: testEnv.wrapper
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(api.loras).toHaveBeenCalled()
    })
  })

  describe('useUploadLoraMutation', () => {
    it('uploads a LoRA and invalidates the loras query cache', async () => {
      const filePath = '/loras/new-lora.safetensors'
      const mockResponse: LoRA = {
        id: 2,
        name: 'New LoRA',
        file_path: filePath,
        file_size: 2048,
        created_at: '2024-02-01T00:00:00Z',
        updated_at: '2024-02-01T00:00:00Z'
      }
      vi.mocked(api.uploadLora).mockResolvedValue(mockResponse)
      const invalidateSpy = vi.spyOn(testEnv.queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useUploadLoraMutation(), {
        wrapper: testEnv.wrapper
      })

      const response = await result.current.mutateAsync(filePath)

      expect(api.uploadLora).toHaveBeenCalledWith(filePath)
      expect(response).toEqual(mockResponse)
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['loras'] })
    })
  })

  describe('useDeleteLoraMutation', () => {
    it('deletes a LoRA and invalidates the loras query cache', async () => {
      const loraId = 5
      const mockResponse: LoRADeleteResponse = {
        id: loraId,
        message: 'LoRA deleted'
      }
      vi.mocked(api.deleteLora).mockResolvedValue(mockResponse)
      const invalidateSpy = vi.spyOn(testEnv.queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useDeleteLoraMutation(), {
        wrapper: testEnv.wrapper
      })

      const response = await result.current.mutateAsync(loraId)

      expect(api.deleteLora).toHaveBeenCalledWith(loraId)
      expect(response).toEqual(mockResponse)
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['loras'] })
    })
  })

  describe('useBackendConfigQuery', () => {
    it('calls api.getConfig and returns the data', async () => {
      const mockResponse: BackendConfig = {
        upscalers: [
          { method: UpscalerMethod.AI, title: 'AI Upscaler', options: [] }
        ],
        safety_check_enabled: true,
        gpu_scale_factor: 0.8,
        ram_scale_factor: 0.8,
        total_gpu_memory: 12485197824,
        total_ram_memory: 32943878144,
        device_index: 0
      }
      vi.mocked(api.getConfig).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useBackendConfigQuery(), {
        wrapper: testEnv.wrapper
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(api.getConfig).toHaveBeenCalled()
      expect(result.current.data).toEqual(mockResponse)
    })

    it('handles error', async () => {
      const mockError = new Error('Failed to fetch config')
      vi.mocked(api.getConfig).mockRejectedValue(mockError)

      const { result } = renderHook(() => useBackendConfigQuery(), {
        wrapper: testEnv.wrapper
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(api.getConfig).toHaveBeenCalled()
    })
  })

  describe('useSafetyCheckMutation', () => {
    it('calls setSafetyCheckEnabled with true and invalidates config cache', async () => {
      vi.mocked(api.setSafetyCheckEnabled).mockResolvedValue(undefined)
      const invalidateSpy = vi.spyOn(testEnv.queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useSafetyCheckMutation(), {
        wrapper: testEnv.wrapper
      })

      await result.current.mutateAsync(true)

      expect(api.setSafetyCheckEnabled).toHaveBeenCalledWith(true)
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['config'] })
    })

    it('calls setSafetyCheckEnabled with false and invalidates config cache', async () => {
      vi.mocked(api.setSafetyCheckEnabled).mockResolvedValue(undefined)
      const invalidateSpy = vi.spyOn(testEnv.queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useSafetyCheckMutation(), {
        wrapper: testEnv.wrapper
      })

      await result.current.mutateAsync(false)

      expect(api.setSafetyCheckEnabled).toHaveBeenCalledWith(false)
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['config'] })
    })

    it('handles error from setSafetyCheckEnabled', async () => {
      const mockError = new Error('Failed to update safety check')
      vi.mocked(api.setSafetyCheckEnabled).mockRejectedValue(mockError)

      const { result } = renderHook(() => useSafetyCheckMutation(), {
        wrapper: testEnv.wrapper
      })

      await expect(result.current.mutateAsync(true)).rejects.toThrow(
        'Failed to update safety check'
      )
      expect(api.setSafetyCheckEnabled).toHaveBeenCalledWith(true)
    })
  })

  describe('useMaxMemoryMutation', () => {
    it('calls setMaxMemory and invalidates config cache', async () => {
      const mockResponse: BackendConfig = {
        upscalers: [],
        safety_check_enabled: true,
        gpu_scale_factor: 0.7,
        ram_scale_factor: 0.6,
        total_gpu_memory: 8589934592,
        total_ram_memory: 17179869184,
        device_index: 0
      }
      vi.mocked(api.setMaxMemory).mockResolvedValue(mockResponse)
      const invalidateSpy = vi.spyOn(testEnv.queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useMaxMemoryMutation(), {
        wrapper: testEnv.wrapper
      })

      await result.current.mutateAsync({
        gpuScaleFactor: 0.7,
        ramScaleFactor: 0.6
      })

      expect(api.setMaxMemory).toHaveBeenCalledWith({
        gpu_scale_factor: 0.7,
        ram_scale_factor: 0.6
      })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['config'] })
    })

    it('handles error from setMaxMemory', async () => {
      const mockError = new Error('Failed to update max memory')
      vi.mocked(api.setMaxMemory).mockRejectedValue(mockError)

      const { result } = renderHook(() => useMaxMemoryMutation(), {
        wrapper: testEnv.wrapper
      })

      await expect(
        result.current.mutateAsync({ gpuScaleFactor: 0.5, ramScaleFactor: 0.5 })
      ).rejects.toThrow('Failed to update max memory')
      expect(api.setMaxMemory).toHaveBeenCalledWith({
        gpu_scale_factor: 0.5,
        ram_scale_factor: 0.5
      })
    })
  })
})
