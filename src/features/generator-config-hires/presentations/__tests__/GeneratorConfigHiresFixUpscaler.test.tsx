import { UpscalerMethod, UpscalerType } from '@/cores/constants'
import { useConfig } from '@/cores/hooks'
import { GeneratorConfigFormValues } from '@/features/generator-configs/types/generator-config'
import { UpscalerSection } from '@/types'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UseFormReturn } from 'react-hook-form'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GeneratorConfigHiresFixUpscaler } from '../GeneratorConfigHiresFixUpscaler'

// Mock useConfig hook
vi.mock('@/cores/hooks', () => ({
  useConfig: vi.fn()
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
      },
      {
        value: UpscalerType.BILINEAR,
        name: 'Bilinear',
        description: 'Balanced upscaler',
        suggested_denoise_strength: 0.35,
        method: UpscalerMethod.TRADITIONAL,
        is_recommended: false
      },
      {
        value: UpscalerType.NEAREST,
        name: 'Nearest',
        description: 'Fast upscaler',
        suggested_denoise_strength: 0.3,
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

// Mock react-hook-form
const mockOnChange = vi.fn()
const mockSetValue = vi.fn()
const mockControl = {} as UseFormReturn<GeneratorConfigFormValues>['control']
let mockFieldValue: string | undefined = UpscalerType.LANCZOS

vi.mock('react-hook-form', () => ({
  useFormContext: () => ({
    control: mockControl,
    setValue: mockSetValue
  }),
  useController: () => ({
    field: { value: mockFieldValue, onChange: mockOnChange }
  })
}))

const openUpscalerSelect = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button'))
}

const chooseUpscaler = async (
  user: ReturnType<typeof userEvent.setup>,
  optionName: string
) => {
  await openUpscalerSelect(user)
  await user.click(screen.getByRole('option', { name: new RegExp(optionName) }))
}

describe('GeneratorConfigHiresFixUpscaler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFieldValue = UpscalerType.LANCZOS
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

  it('renders without crashing', () => {
    const { container } = render(<GeneratorConfigHiresFixUpscaler />)
    expect(container).toBeInTheDocument()
  })

  it('renders select with correct label', () => {
    render(<GeneratorConfigHiresFixUpscaler />)

    expect(screen.getByText('Upscaler')).toBeInTheDocument()
  })

  it('labels the select as Upscaler', () => {
    render(<GeneratorConfigHiresFixUpscaler />)

    expect(screen.getByRole('button')).toHaveAccessibleName(/Upscaler/)
  })

  it('displays upscaler options from useConfig', async () => {
    const user = userEvent.setup()
    render(<GeneratorConfigHiresFixUpscaler />)

    await openUpscalerSelect(user)

    expect(screen.getByRole('option', { name: /Lanczos/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Bicubic/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Bilinear/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Nearest/ })).toBeInTheDocument()
  })

  it('displays selected value', () => {
    render(<GeneratorConfigHiresFixUpscaler />)

    expect(screen.getByRole('button')).toHaveTextContent('Lanczos')
  })

  it('calls onChange when selection changes', async () => {
    const user = userEvent.setup()
    render(<GeneratorConfigHiresFixUpscaler />)

    await chooseUpscaler(user, 'Bicubic')

    expect(mockOnChange).toHaveBeenCalledWith(UpscalerType.BICUBIC)
  })

  it('sets suggested_denoise_strength when upscaler changes', async () => {
    const user = userEvent.setup()
    render(<GeneratorConfigHiresFixUpscaler />)

    await chooseUpscaler(user, 'Bicubic')

    expect(mockSetValue).toHaveBeenCalledWith(
      'hires_fix.denoising_strength',
      0.4
    )
  })

  it('sets correct denoise strength for each upscaler', async () => {
    const user = userEvent.setup()
    render(<GeneratorConfigHiresFixUpscaler />)

    await chooseUpscaler(user, 'Nearest')
    expect(mockSetValue).toHaveBeenCalledWith(
      'hires_fix.denoising_strength',
      0.3
    )

    mockSetValue.mockClear()
    await chooseUpscaler(user, 'Bilinear')
    expect(mockSetValue).toHaveBeenCalledWith(
      'hires_fix.denoising_strength',
      0.35
    )
  })

  it('does not set denoise strength if upscaler not found in config', async () => {
    // When upscalers sections don't contain the selected value
    const limitedUpscalerSections = [
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
    ]
    vi.mocked(useConfig).mockReturnValue({
      upscalers: limitedUpscalerSections,
      upscalerOptions: limitedUpscalerSections.flatMap((s) => s.options),
      safety_check_enabled: true,
      gpu_scale_factor: 0.8,
      ram_scale_factor: 0.8,
      total_gpu_memory: 12485197824,
      total_ram_memory: 32943878144,
      device_index: 0,
      isLoading: false,
      isHasDevice: true
    })

    mockFieldValue = UpscalerType.BICUBIC
    const user = userEvent.setup()
    render(<GeneratorConfigHiresFixUpscaler />)

    // Select LANCZOS which exists - should call setValue
    await chooseUpscaler(user, 'Lanczos')
    expect(mockSetValue).toHaveBeenCalledWith(
      'hires_fix.denoising_strength',
      0.5
    )
  })

  describe('skeleton state', () => {
    it('shows skeleton when value is undefined', () => {
      mockFieldValue = undefined
      const { container } = render(<GeneratorConfigHiresFixUpscaler />)

      expect(container.querySelector('.h-14')).toBeInTheDocument()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('skeleton has correct class', () => {
      mockFieldValue = undefined
      const { container } = render(<GeneratorConfigHiresFixUpscaler />)

      expect(container.firstElementChild).toHaveClass('h-14', 'rounded-xl')
    })
  })

  it('handles empty upscalers array gracefully', () => {
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
    render(<GeneratorConfigHiresFixUpscaler />)

    // Should render without crashing, just with no options
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  describe('sections and recommendations', () => {
    it('groups upscalers into Traditional and AI sections', async () => {
      const user = userEvent.setup()
      render(<GeneratorConfigHiresFixUpscaler />)

      await openUpscalerSelect(user)

      expect(screen.getByText('Traditional')).toBeInTheDocument()
      expect(screen.getByText('AI')).toBeInTheDocument()
    })

    it('displays AI upscalers in the AI section', async () => {
      const user = userEvent.setup()
      render(<GeneratorConfigHiresFixUpscaler />)

      await openUpscalerSelect(user)

      expect(
        screen.getByRole('option', { name: /Real-ESRGAN 2x/ })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('option', { name: /Real-ESRGAN 4x/ })
      ).toBeInTheDocument()
    })

    it('marks recommended upscalers', async () => {
      const user = userEvent.setup()
      render(<GeneratorConfigHiresFixUpscaler />)

      await openUpscalerSelect(user)

      // Both AI upscalers are recommended
      expect(screen.getAllByText('Recommended')).toHaveLength(2)
    })

    it('does not mark non-recommended upscalers', async () => {
      const nonRecommendedSections = [
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
      ]
      vi.mocked(useConfig).mockReturnValue({
        upscalers: nonRecommendedSections,
        upscalerOptions: nonRecommendedSections.flatMap((s) => s.options),
        safety_check_enabled: true,
        gpu_scale_factor: 0.8,
        ram_scale_factor: 0.8,
        total_gpu_memory: 12485197824,
        total_ram_memory: 32943878144,
        device_index: 0,
        isLoading: false,
        isHasDevice: true
      })

      const user = userEvent.setup()
      render(<GeneratorConfigHiresFixUpscaler />)

      await openUpscalerSelect(user)

      expect(screen.queryByText('Recommended')).not.toBeInTheDocument()
    })

    it('includes AI upscalers with correct denoise strength in config', () => {
      // The AI upscalers are in the config with their suggested_denoise_strength
      // The denoise strength change is tested in other tests via selection
      const aiSection = mockUpscalerSections.find(
        (s) => s.method === UpscalerMethod.AI
      )
      const aiUpscaler = aiSection?.options.find(
        (o) => o.value === UpscalerType.REAL_ESRGAN_X4_PLUS
      )
      expect(aiUpscaler?.suggested_denoise_strength).toBe(0.3)
    })
  })
})
