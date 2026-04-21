'use client'

import { useBackendConfigQuery } from '@/cores/api-queries'
import { DeviceSelection } from '@/cores/constants'
import { UpscalerOption, UpscalerSection } from '@/types'

interface ConfigResult {
  upscalers: UpscalerSection[]
  upscalerOptions: UpscalerOption[]
  safety_check_enabled: boolean
  gpu_scale_factor: number
  ram_scale_factor: number
  total_gpu_memory: number
  total_ram_memory: number
  device_index: number
  isLoading: boolean
  isHasDevice: boolean
}

/**
 * Wrapper hook for backend configuration with default values.
 * Returns config with empty arrays as defaults, eliminating null-checking.
 *
 * Extensibility: To add new config fields:
 * 1. Add field to BackendConfig interface in src/types/api.ts
 * 2. Add field to ConfigResult interface below
 * 3. Add field to return object with default value (e.g., `newField: data?.newField ?? []`)
 */
export const useConfig = (): ConfigResult => {
  const { data, isLoading } = useBackendConfigQuery()

  const upscalers = data?.upscalers ?? []
  const upscalerOptions = upscalers.flatMap((section) => section.options)
  const safety_check_enabled = data?.safety_check_enabled ?? true
  const gpu_scale_factor = data?.gpu_scale_factor ?? 0
  const ram_scale_factor = data?.ram_scale_factor ?? 0
  const total_gpu_memory = data?.total_gpu_memory ?? 0
  const total_ram_memory = data?.total_ram_memory ?? 0
  const device_index = data?.device_index ?? DeviceSelection.NOT_FOUND
  const isHasDevice = device_index !== DeviceSelection.NOT_FOUND

  return {
    upscalers,
    upscalerOptions,
    safety_check_enabled,
    gpu_scale_factor,
    ram_scale_factor,
    total_gpu_memory,
    total_ram_memory,
    device_index,
    isLoading,
    isHasDevice
  }
}
