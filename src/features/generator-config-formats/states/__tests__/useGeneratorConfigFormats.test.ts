import { UpscaleFactor, UpscalerMethod, UpscalerType } from '@/cores/constants'
import { useConfig } from '@/cores/hooks'
import { GeneratorConfigFormValues } from '@/features/generator-configs'
import { useHiresFixEnabledStore } from '@/features/generators'
import { UpscalerSection } from '@/types'
import { act, renderHook } from '@testing-library/react'
import { UseFormReturn } from 'react-hook-form'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGeneratorConfigFormats } from '../useGeneratorConfigFormats'

vi.mock('@/cores/hooks', () => ({
  useConfig: vi.fn()
}))

vi.mock('@/features/generators', () => ({
  useHiresFixEnabledStore: vi.fn()
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
        name: 'RealESRGAN_x2plus',
        description: 'AI upscaler 2x',
        suggested_denoise_strength: 0.35,
        method: UpscalerMethod.AI,
        is_recommended: true
      },
      {
        value: UpscalerType.REAL_ESRGAN_X4_PLUS,
        name: 'RealESRGAN_x4plus',
        description: 'AI upscaler 4x',
        suggested_denoise_strength: 0.3,
        method: UpscalerMethod.AI,
        is_recommended: false
      }
    ]
  }
]

const mockUpscalerOptions = mockUpscalerSections.flatMap(
  (section) => section.options
)

const mockWatch = vi.fn()
const mockRegister = vi.fn()
const mockSetValue = vi.fn()

vi.mock('react-hook-form', () => ({
  useFormContext: () =>
    ({
      watch: mockWatch,
      register: mockRegister,
      setValue: mockSetValue
    }) as Partial<UseFormReturn<GeneratorConfigFormValues>>
}))

const mockSetIsHiresFixEnabled = vi.fn()
let mockIsHiresFixEnabled = false

describe('useGeneratorConfigFormats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsHiresFixEnabled = false
    vi.mocked(useHiresFixEnabledStore).mockReturnValue({
      isHiresFixEnabled: mockIsHiresFixEnabled,
      setIsHiresFixEnabled: mockSetIsHiresFixEnabled
    })
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

  describe('initialization', () => {
    it('initializes with hires fix disabled when no value exists', () => {
      mockWatch.mockReturnValue(undefined)

      const { result } = renderHook(() => useGeneratorConfigFormats())

      expect(result.current.isHiresFixEnabled).toBe(false)
      expect(mockWatch).toHaveBeenCalledWith('hires_fix')
    })

    it('initializes with hires fix enabled when store value is true', () => {
      mockWatch.mockReturnValue({
        upscale_factor: UpscaleFactor.TWO,
        upscaler: UpscalerType.LANCZOS,
        denoising_strength: 0.5,
        steps: 0
      })
      vi.mocked(useHiresFixEnabledStore).mockReturnValue({
        isHiresFixEnabled: true,
        setIsHiresFixEnabled: mockSetIsHiresFixEnabled
      })

      const { result } = renderHook(() => useGeneratorConfigFormats())

      expect(result.current.isHiresFixEnabled).toBe(true)
    })
  })

  describe('onHiresFixToggle - enable', () => {
    beforeEach(() => {
      mockWatch.mockReturnValue(undefined)
    })

    it('registers hires_fix field when toggled on', () => {
      const { result } = renderHook(() => useGeneratorConfigFormats())

      act(() => {
        result.current.onHiresFixToggle(true)
      })

      expect(mockRegister).toHaveBeenCalledWith('hires_fix')
    })

    it('sets default values with RealESRGAN_x2plus when toggled on (first-time user)', () => {
      const { result } = renderHook(() => useGeneratorConfigFormats())

      act(() => {
        result.current.onHiresFixToggle(true)
      })

      expect(mockSetValue).toHaveBeenCalledWith('hires_fix', {
        upscale_factor: UpscaleFactor.TWO,
        upscaler: UpscalerType.REAL_ESRGAN_X2_PLUS,
        denoising_strength: 0.35,
        steps: 0
      })
    })

    it('uses suggested_denoise_strength from RealESRGAN_x2plus', () => {
      const { result } = renderHook(() => useGeneratorConfigFormats())

      act(() => {
        result.current.onHiresFixToggle(true)
      })

      const setValueCall = mockSetValue.mock.calls[0]
      expect(setValueCall[1].denoising_strength).toBe(0.35)
    })

    it('falls back to first upscaler if RealESRGAN_x2plus not available', () => {
      vi.mocked(useConfig).mockReturnValue({
        upscalers: [
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
              }
            ]
          }
        ],
        upscalerOptions: [
          {
            value: UpscalerType.LANCZOS,
            name: 'Lanczos',
            description: 'High quality upscaler',
            suggested_denoise_strength: 0.5,
            method: UpscalerMethod.TRADITIONAL,
            is_recommended: false
          }
        ],
        safety_check_enabled: true,
        gpu_scale_factor: 0.8,
        ram_scale_factor: 0.8,
        total_gpu_memory: 12485197824,
        total_ram_memory: 32943878144,
        device_index: 0,
        isLoading: false,
        isHasDevice: true
      })

      const { result } = renderHook(() => useGeneratorConfigFormats())

      act(() => {
        result.current.onHiresFixToggle(true)
      })

      const setValueCall = mockSetValue.mock.calls[0]
      expect(setValueCall[1].upscaler).toBe(UpscalerType.LANCZOS)
      expect(setValueCall[1].denoising_strength).toBe(0.5)
    })

    it('does not set default values when user already has hires_fix config', () => {
      mockWatch.mockReturnValue({
        upscale_factor: UpscaleFactor.THREE,
        upscaler: UpscalerType.NEAREST,
        denoising_strength: 0.3,
        steps: 10
      })

      const { result } = renderHook(() => useGeneratorConfigFormats())

      act(() => {
        result.current.onHiresFixToggle(true)
      })

      expect(mockRegister).toHaveBeenCalledWith('hires_fix')
      expect(mockSetValue).not.toHaveBeenCalled()
    })

    it('does not set default values when no upscalers available', () => {
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

      const { result } = renderHook(() => useGeneratorConfigFormats())

      act(() => {
        result.current.onHiresFixToggle(true)
      })

      expect(mockRegister).toHaveBeenCalledWith('hires_fix')
      expect(mockSetValue).not.toHaveBeenCalled()
    })
  })

  describe('onHiresFixToggle - disable', () => {
    it('sets enable flag to false when toggled off', () => {
      mockWatch.mockReturnValue(undefined)
      const { result } = renderHook(() => useGeneratorConfigFormats())

      act(() => {
        result.current.onHiresFixToggle(false)
      })

      expect(mockSetIsHiresFixEnabled).toHaveBeenCalledWith(false)
    })
  })

  describe('return values', () => {
    it('returns isHiresFixEnabled', () => {
      mockWatch.mockReturnValue(undefined)

      const { result } = renderHook(() => useGeneratorConfigFormats())

      expect(typeof result.current.isHiresFixEnabled).toBe('boolean')
    })

    it('returns onHiresFixToggle function', () => {
      mockWatch.mockReturnValue(undefined)

      const { result } = renderHook(() => useGeneratorConfigFormats())

      expect(typeof result.current.onHiresFixToggle).toBe('function')
    })
  })
})
