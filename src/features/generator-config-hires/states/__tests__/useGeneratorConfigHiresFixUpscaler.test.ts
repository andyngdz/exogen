import { UpscalerMethod, UpscalerType } from '@/cores/constants'
import { useConfig } from '@/cores/hooks'
import { GeneratorConfigFormValues } from '@/features/generator-configs'
import { UpscalerSection } from '@/types'
import { renderHook } from '@testing-library/react'
import { UseFormReturn } from 'react-hook-form'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGeneratorConfigHiresFixUpscaler } from '../useGeneratorConfigHiresFixUpscaler'

vi.mock('@/cores/hooks', () => ({
  useConfig: vi.fn()
}))

const mockSetValue = vi.fn()

vi.mock('react-hook-form', () => ({
  useFormContext: () =>
    ({
      setValue: mockSetValue
    }) as Partial<UseFormReturn<GeneratorConfigFormValues>>
}))

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
  },
  {
    method: UpscalerMethod.AI,
    title: 'AI',
    options: [
      {
        value: UpscalerType.REAL_ESRGAN_X2_PLUS,
        name: 'Real-ESRGAN 2x',
        description: 'AI upscaler 2x',
        suggested_denoise_strength: 0.35,
        method: UpscalerMethod.AI,
        is_recommended: true
      },
      {
        value: UpscalerType.REAL_ESRGAN_X4_PLUS,
        name: 'Real-ESRGAN 4x',
        description: 'AI upscaler 4x',
        suggested_denoise_strength: 0.3,
        method: UpscalerMethod.AI,
        is_recommended: true
      }
    ]
  }
]

const mockUpscalerOptions = mockUpscalerSections.flatMap(
  (section) => section.options
)

describe('useGeneratorConfigHiresFixUpscaler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useConfig).mockReturnValue({
      upscalers: mockUpscalerSections,
      upscalerOptions: mockUpscalerOptions,
      safety_check_enabled: true,
      gpu_scale_factor: 0.8,
      ram_scale_factor: 0.8,
      total_gpu_memory: 12485197824,
      total_ram_memory: 32943878144,
      device_index: 0,
      isLoading: false,
      isHasDevice: true
    })
  })

  describe('upscalers', () => {
    it('returns sections from useConfig', () => {
      const { result } = renderHook(() => useGeneratorConfigHiresFixUpscaler())

      expect(result.current.upscalers).toHaveLength(2)
      expect(result.current.upscalers[0].method).toBe(
        UpscalerMethod.TRADITIONAL
      )
      expect(result.current.upscalers[1].method).toBe(UpscalerMethod.AI)
    })

    it('returns traditional section with correct options', () => {
      const { result } = renderHook(() => useGeneratorConfigHiresFixUpscaler())

      const traditionalSection = result.current.upscalers[0]
      expect(traditionalSection.options).toHaveLength(2)
      expect(traditionalSection.options[0].value).toBe(UpscalerType.LANCZOS)
      expect(traditionalSection.options[1].value).toBe(UpscalerType.BICUBIC)
    })

    it('returns AI section with correct options', () => {
      const { result } = renderHook(() => useGeneratorConfigHiresFixUpscaler())

      const aiSection = result.current.upscalers[1]
      expect(aiSection.options).toHaveLength(2)
      expect(aiSection.options[0].value).toBe(UpscalerType.REAL_ESRGAN_X2_PLUS)
      expect(aiSection.options[1].value).toBe(UpscalerType.REAL_ESRGAN_X4_PLUS)
    })

    it('returns empty array when no sections', () => {
      vi.mocked(useConfig).mockReturnValue({
        upscalers: [],
        upscalerOptions: [],
        safety_check_enabled: true,
        gpu_scale_factor: 0.8,
        ram_scale_factor: 0.8,
        total_gpu_memory: 12485197824,
        total_ram_memory: 32943878144,
        device_index: 0,
        isLoading: false,
        isHasDevice: true
      })

      const { result } = renderHook(() => useGeneratorConfigHiresFixUpscaler())

      expect(result.current.upscalers).toHaveLength(0)
    })
  })

  describe('onUpscalerChange', () => {
    it('sets denoise strength for traditional upscaler', () => {
      const { result } = renderHook(() => useGeneratorConfigHiresFixUpscaler())

      result.current.onUpscalerChange(UpscalerType.LANCZOS)

      expect(mockSetValue).toHaveBeenCalledWith(
        'hires_fix.denoising_strength',
        0.5
      )
    })

    it('sets denoise strength for AI upscaler', () => {
      const { result } = renderHook(() => useGeneratorConfigHiresFixUpscaler())

      result.current.onUpscalerChange(UpscalerType.REAL_ESRGAN_X4_PLUS)

      expect(mockSetValue).toHaveBeenCalledWith(
        'hires_fix.denoising_strength',
        0.3
      )
    })

    it('does not set value when upscaler not found', () => {
      const { result } = renderHook(() => useGeneratorConfigHiresFixUpscaler())

      result.current.onUpscalerChange('unknown-upscaler')

      expect(mockSetValue).not.toHaveBeenCalled()
    })
  })
})
