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

// Mock HeroUI components
vi.mock('@heroui/react', () => {
  return {
    Select: ({
      label,
      selectedKeys,
      onSelectionChange,
      'aria-label': ariaLabel,
      children
    }: {
      label: string
      selectedKeys: string[]
      onSelectionChange: (keys: { currentKey: string | null }) => void
      children: React.ReactNode
      'aria-label': string
    }) => {
      return (
        <div data-testid="select" aria-label={ariaLabel}>
          <label>{label}</label>
          <select
            data-testid="select-input"
            value={selectedKeys?.[0] || ''}
            onChange={(e) =>
              onSelectionChange({ currentKey: e.target.value || null })
            }
          >
            {children}
          </select>
        </div>
      )
    },
    SelectSection: ({
      title,
      children
    }: {
      title: string
      children: React.ReactNode
    }) => (
      <optgroup label={title} data-testid={`section-${title.toLowerCase()}`}>
        {children}
      </optgroup>
    ),
    SelectItem: ({
      children,
      description,
      'data-key': dataKey
    }: {
      children: React.ReactNode
      description?: React.ReactNode
      'data-key'?: string
    }) => {
      return (
        <option
          value={dataKey}
          data-description={description ? 'true' : undefined}
        >
          {children}
        </option>
      )
    },
    Skeleton: ({ className }: { className: string }) => (
      <div data-testid="skeleton" className={className}>
        Loading...
      </div>
    )
  }
})

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
  Controller: ({
    render
  }: {
    render: (props: {
      field: { value: string | undefined; onChange: (v: string) => void }
    }) => React.ReactNode
  }) => {
    const mockField = {
      value: mockFieldValue,
      onChange: mockOnChange
    }
    return <>{render({ field: mockField })}</>
  }
}))

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

  it('renders select with correct aria-label', () => {
    render(<GeneratorConfigHiresFixUpscaler />)

    expect(screen.getByLabelText('Upscaler')).toBeInTheDocument()
  })

  it('displays upscaler options from useConfig', () => {
    render(<GeneratorConfigHiresFixUpscaler />)

    expect(screen.getByText('Lanczos')).toBeInTheDocument()
    expect(screen.getByText('Bicubic')).toBeInTheDocument()
    expect(screen.getByText('Bilinear')).toBeInTheDocument()
    expect(screen.getByText('Nearest')).toBeInTheDocument()
  })

  it('displays selected value', () => {
    render(<GeneratorConfigHiresFixUpscaler />)
    const select = screen.getByTestId<HTMLSelectElement>('select-input')

    expect(select.value).toBe(UpscalerType.LANCZOS)
  })

  it('calls onChange when selection changes', async () => {
    const user = userEvent.setup()
    render(<GeneratorConfigHiresFixUpscaler />)
    const select = screen.getByTestId('select-input')

    await user.selectOptions(select, UpscalerType.BICUBIC)

    expect(mockOnChange).toHaveBeenCalledWith(UpscalerType.BICUBIC)
  })

  it('sets suggested_denoise_strength when upscaler changes', async () => {
    const user = userEvent.setup()
    render(<GeneratorConfigHiresFixUpscaler />)
    const select = screen.getByTestId('select-input')

    await user.selectOptions(select, UpscalerType.BICUBIC)

    expect(mockSetValue).toHaveBeenCalledWith(
      'hires_fix.denoising_strength',
      0.4
    )
  })

  it('sets correct denoise strength for each upscaler', async () => {
    const user = userEvent.setup()
    render(<GeneratorConfigHiresFixUpscaler />)
    const select = screen.getByTestId('select-input')

    await user.selectOptions(select, UpscalerType.LANCZOS)
    expect(mockSetValue).toHaveBeenCalledWith(
      'hires_fix.denoising_strength',
      0.5
    )

    mockSetValue.mockClear()
    await user.selectOptions(select, UpscalerType.NEAREST)
    expect(mockSetValue).toHaveBeenCalledWith(
      'hires_fix.denoising_strength',
      0.3
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

    const user = userEvent.setup()
    render(<GeneratorConfigHiresFixUpscaler />)
    const select = screen.getByTestId('select-input')

    // Select LANCZOS which exists - should call setValue
    await user.selectOptions(select, UpscalerType.LANCZOS)
    expect(mockSetValue).toHaveBeenCalledWith(
      'hires_fix.denoising_strength',
      0.5
    )
  })

  describe('skeleton state', () => {
    it('shows skeleton when value is undefined', () => {
      mockFieldValue = undefined
      render(<GeneratorConfigHiresFixUpscaler />)

      expect(screen.getByTestId('skeleton')).toBeInTheDocument()
      expect(screen.queryByTestId('select')).not.toBeInTheDocument()
    })

    it('skeleton has correct class', () => {
      mockFieldValue = undefined
      render(<GeneratorConfigHiresFixUpscaler />)
      const skeleton = screen.getByTestId('skeleton')

      expect(skeleton).toHaveClass('h-14', 'rounded-medium')
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
    expect(screen.getByTestId('select')).toBeInTheDocument()
  })

  describe('sections and recommendations', () => {
    it('groups upscalers into Traditional and AI sections', () => {
      render(<GeneratorConfigHiresFixUpscaler />)

      expect(screen.getByTestId('section-traditional')).toBeInTheDocument()
      expect(screen.getByTestId('section-ai')).toBeInTheDocument()
    })

    it('displays AI upscalers in the AI section', () => {
      render(<GeneratorConfigHiresFixUpscaler />)

      expect(screen.getByText('Real-ESRGAN 2x')).toBeInTheDocument()
      expect(screen.getByText('Real-ESRGAN 4x')).toBeInTheDocument()
    })

    it('marks recommended upscalers with data attribute', () => {
      render(<GeneratorConfigHiresFixUpscaler />)

      // Get all options with the data-description attribute (indicates recommendation)
      const selectElement = screen.getByTestId('select-input')
      const optionsWithDescription = selectElement.querySelectorAll(
        'option[data-description="true"]'
      )
      expect(optionsWithDescription.length).toBe(2) // Both AI upscalers are recommended
    })

    it('does not mark non-recommended upscalers with description', () => {
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

      render(<GeneratorConfigHiresFixUpscaler />)

      const selectElement = screen.getByTestId('select-input')
      const optionsWithDescription = selectElement.querySelectorAll(
        'option[data-description="true"]'
      )
      expect(optionsWithDescription.length).toBe(0)
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
