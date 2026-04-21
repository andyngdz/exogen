import { GeneratorConfigFormValues } from '@/features/generator-configs/types/generator-config'
import { fireEvent, render, screen } from '@testing-library/react'
import { UseFormReturn } from 'react-hook-form'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GeneratorConfigHiresFix } from '../GeneratorConfigHiresFix'

// Mock child components
vi.mock('../GeneratorConfigHiresFixUpscaleFactor', () => ({
  GeneratorConfigHiresFixUpscaleFactor: () => (
    <div data-testid="upscale-factor">Upscale Factor</div>
  )
}))

vi.mock('../GeneratorConfigHiresFixUpscaler', () => ({
  GeneratorConfigHiresFixUpscaler: () => (
    <div data-testid="upscaler">Upscaler</div>
  )
}))

// Mock NumberInputController
vi.mock('@/cores/presentations/NumberInputController', () => ({
  NumberInputController: ({
    'aria-label': ariaLabel,
    startContent,
    description
  }: {
    'aria-label': string
    startContent: React.ReactNode
    description: string
  }) => (
    <div data-testid="number-input" aria-label={ariaLabel}>
      {startContent}
      <span>{description}</span>
    </div>
  )
}))

// Mock HeroUI Slider
vi.mock('@heroui/react', () => ({
  Slider: ({
    label,
    value,
    onChange,
    minValue,
    maxValue,
    step
  }: {
    label: string
    value: number
    onChange: (value: number) => void
    minValue: number
    maxValue: number
    step: number
  }) => (
    <div data-testid="denoising-slider">
      <label>{label}</label>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={minValue}
        max={maxValue}
        step={step}
        aria-label={label}
      />
    </div>
  )
}))

// Mock react-hook-form
const mockControl = {} as UseFormReturn<GeneratorConfigFormValues>['control']
const mockOnChange = vi.fn()

vi.mock('react-hook-form', () => ({
  useFormContext: () => ({
    control: mockControl
  }),
  Controller: ({
    render,
    name
  }: {
    render: (props: {
      field: { value: number; onChange: (v: number) => void }
    }) => React.ReactNode
    name: string
  }) => {
    const mockField = {
      value: name === 'hires_fix.denoising_strength' ? 0.7 : 0,
      onChange: mockOnChange
    }
    return <>{render({ field: mockField })}</>
  }
}))

describe('GeneratorConfigHiresFix', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    const { container } = render(<GeneratorConfigHiresFix />)
    expect(container).toBeInTheDocument()
  })

  it('renders upscale factor component', () => {
    render(<GeneratorConfigHiresFix />)

    expect(screen.getByTestId('upscale-factor')).toBeInTheDocument()
  })

  it('renders upscaler component', () => {
    render(<GeneratorConfigHiresFix />)

    expect(screen.getByTestId('upscaler')).toBeInTheDocument()
  })

  it('renders denoising strength slider', () => {
    render(<GeneratorConfigHiresFix />)

    expect(screen.getByTestId('denoising-slider')).toBeInTheDocument()
    expect(screen.getByLabelText('Denoising Strength')).toBeInTheDocument()
  })

  it('renders hires steps input', () => {
    render(<GeneratorConfigHiresFix />)

    expect(screen.getByTestId('number-input')).toBeInTheDocument()
    expect(screen.getByText('Hires Steps')).toBeInTheDocument()
  })

  it('shows description for hires steps', () => {
    render(<GeneratorConfigHiresFix />)

    expect(screen.getByText('0 = use same as base steps')).toBeInTheDocument()
  })

  it('denoising slider has correct range', () => {
    render(<GeneratorConfigHiresFix />)
    const slider = screen.getByLabelText(
      'Denoising Strength'
    ) as HTMLInputElement

    expect(slider.min).toBe('0')
    expect(slider.max).toBe('1')
    expect(slider.step).toBe('0.05')
  })

  it('denoising slider displays current value', () => {
    render(<GeneratorConfigHiresFix />)
    const slider = screen.getByLabelText(
      'Denoising Strength'
    ) as HTMLInputElement

    expect(slider.value).toBe('0.7')
  })

  it('calls onChange when denoising slider value changes', () => {
    render(<GeneratorConfigHiresFix />)
    const slider = screen.getByLabelText(
      'Denoising Strength'
    ) as HTMLInputElement

    fireEvent.change(slider, { target: { value: '0.5' } })

    expect(mockOnChange).toHaveBeenCalledWith(0.5)
  })
})
