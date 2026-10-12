import { api } from '@/services/api'
import { apiErrorService } from '@/services/errors'
import { toast } from '@heroui/react'
import {
  ApiError,
  BackendConfig,
  HardwareMemoryResponse,
  HardwareResponse,
  HealthResponse,
  HistoryItem,
  LoRA,
  MaxMemoryParams,
  ModelDownloaded,
  ModelRecommendationResponse,
  Sampler,
  StyleSection
} from '@/types'
import {
  Query,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import { isAxiosError } from 'axios'

const HARDWARE_MEMORY_POLL_MS = 5000

const useHealthQuery = (enabled = true) => {
  return useQuery<HealthResponse, ApiError>({
    queryKey: ['health'],
    queryFn: () => api.health(),
    refetchInterval: 3000,
    enabled
  })
}

const useHardwareQuery = () => {
  return useQuery<HardwareResponse, ApiError>({
    queryKey: ['getHardwareStatus'],
    queryFn: () => api.getHardwareStatus()
  })
}

const isNotFoundError = (error: unknown) =>
  isAxiosError(error) && error.response?.status === 404

/** False once the backend answered 404, which means it predates the endpoint. */
const isHardwareMemorySupported = (
  query: Query<HardwareMemoryResponse, ApiError>
) => !isNotFoundError(query.state.error)

/**
 * Polls memory in use on the accelerator. A backend without the endpoint
 * answers 404; after that nothing refetches it, not the interval, a window
 * focus or a remount, for the rest of the session.
 */
const useHardwareMemoryQuery = () => {
  return useQuery<HardwareMemoryResponse, ApiError>({
    queryKey: ['getHardwareMemory'],
    queryFn: () => api.getHardwareMemory(),
    retry: false,
    refetchInterval: (query) =>
      isHardwareMemorySupported(query) ? HARDWARE_MEMORY_POLL_MS : false,
    refetchOnWindowFocus: isHardwareMemorySupported,
    refetchOnMount: isHardwareMemorySupported
  })
}

const useModelRecommendationsQuery = () => {
  return useQuery<ModelRecommendationResponse, ApiError>({
    queryKey: ['getModelRecommendations'],
    queryFn: () => api.getModelRecommendations()
  })
}

const useDownloadedModelsQuery = () => {
  return useQuery<ModelDownloaded[], ApiError>({
    queryKey: ['getDownloadedModels'],
    queryFn: () => api.getDownloadedModels()
  })
}

const useStyleSectionsQuery = () => {
  return useQuery<StyleSection[], ApiError>({
    queryKey: ['styles'],
    queryFn: () => api.styles()
  })
}

const useHistoriesQuery = () => {
  return useQuery<HistoryItem[], ApiError>({
    queryKey: ['getHistories'],
    queryFn: () => api.getHistories()
  })
}

const useSamplersQuery = () => {
  return useQuery<Sampler[], ApiError>({
    queryKey: ['getSamplers'],
    queryFn: () => api.getSamplers()
  })
}

const useLorasQuery = () => {
  return useQuery<LoRA[], ApiError>({
    queryKey: ['loras'],
    queryFn: async () => {
      const response = await api.loras()
      return response.loras
    }
  })
}

const useUploadLoraMutation = () => {
  const queryClient = useQueryClient()
  return useMutation<LoRA, ApiError, string>({
    mutationFn: (file_path: string) => api.uploadLora(file_path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loras'] })
    },
    onError: (error) => {
      toast.danger('Upload failed', {
        description: apiErrorService.toMessage(
          error,
          'Check that the file is a LoRA model and try again.'
        )
      })
    }
  })
}

const useBackendConfigQuery = () => {
  return useQuery<BackendConfig, ApiError>({
    queryKey: ['config'],
    queryFn: () => api.getConfig(),
    staleTime: Infinity
  })
}

const useSafetyCheckMutation = () => {
  const queryClient = useQueryClient()
  return useMutation<void, ApiError, boolean>({
    mutationFn: (enabled: boolean) => api.setSafetyCheckEnabled(enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] })
    },
    onError: (error) => {
      toast.danger('Safety check not changed', {
        description: apiErrorService.toMessage(
          error,
          'The backend did not save the setting. Try again.'
        )
      })
    }
  })
}

const useMaxMemoryMutation = () => {
  const queryClient = useQueryClient()
  return useMutation<BackendConfig, ApiError, MaxMemoryParams>({
    mutationFn: ({ gpuScaleFactor, ramScaleFactor }) =>
      api.setMaxMemory({
        gpu_scale_factor: gpuScaleFactor,
        ram_scale_factor: ramScaleFactor
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] })
    },
    onError: (error) => {
      toast.danger('Memory limits not saved', {
        description: apiErrorService.toMessage(
          error,
          'The backend kept the previous limits. Try again.'
        )
      })
    }
  })
}

export {
  useBackendConfigQuery,
  useDownloadedModelsQuery,
  useHardwareMemoryQuery,
  useHardwareQuery,
  useHealthQuery,
  useHistoriesQuery,
  useLorasQuery,
  useMaxMemoryMutation,
  useModelRecommendationsQuery,
  useSafetyCheckMutation,
  useSamplersQuery,
  useStyleSectionsQuery,
  useUploadLoraMutation
}
