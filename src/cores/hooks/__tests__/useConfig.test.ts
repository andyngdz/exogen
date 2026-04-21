import { useBackendConfigQuery } from '@/cores/api-queries'
import {
  DeviceSelection,
  UpscalerMethod,
  UpscalerType
} from '@/cores/constants'
import { createQueryClientWrapper } from '@/cores/test-utils/query-client'
import { createMockQueryResult } from '@/cores/test-utils/query-result-mock'
import { BackendConfig, UpscalerSection } from '@/types'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useConfig } from '../useConfig'

vi.mock('@/cores/api-queries', () => ({
  useBackendConfigQuery: vi.fn()
}))

describe('useConfig', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should return empty arrays and default values when query returns undefined', () => {
    // Arrange
    vi.mocked(useBackendConfigQuery).mockReturnValue(
      createMockQueryResult<BackendConfig>()
    )

    // Act
    const { result } = renderHook(() => useConfig(), {
      wrapper: createQueryClientWrapper()
    })

    // Assert
    expect(result.current.upscalers).toEqual([])
    expect(result.current.upscalerOptions).toEqual([])
    expect(result.current.safety_check_enabled).toBe(true)
    expect(result.current.gpu_scale_factor).toBe(0)
    expect(result.current.ram_scale_factor).toBe(0)
    expect(result.current.total_gpu_memory).toBe(0)
    expect(result.current.total_ram_memory).toBe(0)
    expect(result.current.device_index).toBe(DeviceSelection.NOT_FOUND)
  })

  it('should return upscalers and upscalerOptions from the query data', () => {
    // Arrange
    const mockUpscalerSections: UpscalerSection[] = [
      {
        method: UpscalerMethod.TRADITIONAL,
        title: 'Traditional',
        options: [
          {
            value: UpscalerType.LANCZOS,
            name: 'Lanczos',
            description: 'High quality upscaler',
            suggested_denoise_strength: 0.5,
            method: UpscalerMethod.TRADITIONAL,
            is_recommended: false
          },
          {
            value: UpscalerType.BICUBIC,
            name: 'Bicubic',
            description: 'Smooth upscaler',
            suggested_denoise_strength: 0.4,
            method: UpscalerMethod.TRADITIONAL,
            is_recommended: false
          }
        ]
      }
    ]

    const mockConfig: BackendConfig = {
      upscalers: mockUpscalerSections,
      safety_check_enabled: false,
      gpu_scale_factor: 0.8,
      ram_scale_factor: 0.7,
      total_gpu_memory: 12485197824,
      total_ram_memory: 32943878144,
      device_index: 0
    }

    vi.mocked(useBackendConfigQuery).mockReturnValue(
      createMockQueryResult(mockConfig)
    )

    // Act
    const { result } = renderHook(() => useConfig(), {
      wrapper: createQueryClientWrapper()
    })

    // Assert
    expect(result.current.upscalers).toEqual(mockUpscalerSections)
    expect(result.current.upscalerOptions).toEqual(
      mockUpscalerSections[0].options
    )
    expect(result.current.safety_check_enabled).toBe(false)
    expect(result.current.gpu_scale_factor).toBe(0.8)
    expect(result.current.ram_scale_factor).toBe(0.7)
    expect(result.current.total_gpu_memory).toBe(12485197824)
    expect(result.current.total_ram_memory).toBe(32943878144)
    expect(result.current.device_index).toBe(0)
  })

  it('should return empty arrays and default values when config has no fields', () => {
    // Arrange
    const mockConfig = {} as BackendConfig

    vi.mocked(useBackendConfigQuery).mockReturnValue(
      createMockQueryResult(mockConfig)
    )

    // Act
    const { result } = renderHook(() => useConfig(), {
      wrapper: createQueryClientWrapper()
    })

    // Assert
    expect(result.current.upscalers).toEqual([])
    expect(result.current.upscalerOptions).toEqual([])
    expect(result.current.safety_check_enabled).toBe(true)
    expect(result.current.gpu_scale_factor).toBe(0)
    expect(result.current.ram_scale_factor).toBe(0)
    expect(result.current.total_gpu_memory).toBe(0)
    expect(result.current.total_ram_memory).toBe(0)
    expect(result.current.device_index).toBe(DeviceSelection.NOT_FOUND)
  })

  describe('isLoading', () => {
    it('should return isLoading true when query is loading', () => {
      // Arrange
      vi.mocked(useBackendConfigQuery).mockReturnValue(
        createMockQueryResult<BackendConfig>(undefined, { isLoading: true })
      )

      // Act
      const { result } = renderHook(() => useConfig(), {
        wrapper: createQueryClientWrapper()
      })

      // Assert
      expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading false when query completes', () => {
      // Arrange
      const mockConfig: BackendConfig = {
        upscalers: [],
        safety_check_enabled: true,
        gpu_scale_factor: 0.5,
        ram_scale_factor: 0.5,
        total_gpu_memory: 12485197824,
        total_ram_memory: 32943878144,
        device_index: 0
      }

      vi.mocked(useBackendConfigQuery).mockReturnValue(
        createMockQueryResult(mockConfig, { isLoading: false })
      )

      // Act
      const { result } = renderHook(() => useConfig(), {
        wrapper: createQueryClientWrapper()
      })

      // Assert
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('isHasDevice', () => {
    it('should return isHasDevice true when device_index is valid', () => {
      // Arrange
      const mockConfig: BackendConfig = {
        upscalers: [],
        safety_check_enabled: true,
        gpu_scale_factor: 0.5,
        ram_scale_factor: 0.5,
        total_gpu_memory: 12485197824,
        total_ram_memory: 32943878144,
        device_index: 0
      }

      vi.mocked(useBackendConfigQuery).mockReturnValue(
        createMockQueryResult(mockConfig)
      )

      // Act
      const { result } = renderHook(() => useConfig(), {
        wrapper: createQueryClientWrapper()
      })

      // Assert
      expect(result.current.isHasDevice).toBe(true)
    })

    it('should return isHasDevice false when device_index is NOT_FOUND', () => {
      // Arrange
      const mockConfig: BackendConfig = {
        upscalers: [],
        safety_check_enabled: true,
        gpu_scale_factor: 0.5,
        ram_scale_factor: 0.5,
        total_gpu_memory: 12485197824,
        total_ram_memory: 32943878144,
        device_index: DeviceSelection.NOT_FOUND
      }

      vi.mocked(useBackendConfigQuery).mockReturnValue(
        createMockQueryResult(mockConfig)
      )

      // Act
      const { result } = renderHook(() => useConfig(), {
        wrapper: createQueryClientWrapper()
      })

      // Assert
      expect(result.current.isHasDevice).toBe(false)
    })

    it('should return isHasDevice false when config is not loaded', () => {
      // Arrange
      vi.mocked(useBackendConfigQuery).mockReturnValue(
        createMockQueryResult<BackendConfig>(undefined, { isLoading: true })
      )

      // Act
      const { result } = renderHook(() => useConfig(), {
        wrapper: createQueryClientWrapper()
      })

      // Assert
      expect(result.current.isHasDevice).toBe(false)
    })
  })
})
