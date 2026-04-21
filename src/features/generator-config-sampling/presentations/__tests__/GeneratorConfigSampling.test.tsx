import { createGeneratorConfigFormWrapper } from '@/cores/test-utils'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GeneratorConfigSampling } from '../GeneratorConfigSampling'

// Mock the NumberInputController component
vi.mock('@/cores/presentations/NumberInputController', () => ({
  NumberInputController: ({
    controlName,
    startContent,
    minValue,
    maximumFractionDigits,
    'aria-label': ariaLabel
  }: {
    controlName: string
    startContent: React.ReactNode
    minValue?: number
    maximumFractionDigits?: number
    'aria-label'?: string
  }) => (
    <div data-testid={`number-input-${controlName}`}>
      <div>{startContent}</div>
      <input
        type="number"
        aria-label={ariaLabel}
        data-testid={`input-${controlName}`}
        min={minValue}
        step={
          maximumFractionDigits ? 1 / Math.pow(10, maximumFractionDigits) : 1
        }
      />
    </div>
  )
}))

// Mock the GeneratorConfigCommonSteps component
vi.mock('../GeneratorConfigCommonSteps', () => ({
  GeneratorConfigCommonSteps: () => <div data-testid="common-steps" />
}))

// Mock the GeneratorConfigSamplerDropdown component
vi.mock('../GeneratorConfigSamplerDropdown', () => ({
  GeneratorConfigSamplerDropdown: () => <div data-testid="sampler-dropdown" />
}))

describe('GeneratorConfigSampling', () => {
  const Wrapper = createGeneratorConfigFormWrapper({
    overrides: {
      steps: 20,
      cfg_scale: 7.5,
      clip_skip: 2
    }
  })

  it('renders the sampling section with correct title', () => {
    render(<GeneratorConfigSampling />, { wrapper: Wrapper })
    expect(screen.getByText('Sampling')).toBeInTheDocument()
  })

  it('renders the steps input with correct properties', () => {
    render(<GeneratorConfigSampling />, { wrapper: Wrapper })
    const stepsInput = screen.getByTestId('number-input-steps')
    expect(stepsInput).toBeInTheDocument()
    expect(screen.getByText('Steps')).toBeInTheDocument()
  })

  it('renders the common steps component', () => {
    render(<GeneratorConfigSampling />, { wrapper: Wrapper })
    expect(screen.getByTestId('common-steps')).toBeInTheDocument()
  })

  it('renders the CFG Scale input with correct properties', () => {
    render(<GeneratorConfigSampling />, { wrapper: Wrapper })
    const cfgScaleInput = screen.getByTestId('number-input-cfg_scale')
    expect(cfgScaleInput).toBeInTheDocument()
    expect(screen.getByText('CFG Scale')).toBeInTheDocument()
  })

  it('renders the CLIP Skip input with correct properties', () => {
    render(<GeneratorConfigSampling />, { wrapper: Wrapper })
    const clipSkipInput = screen.getByTestId('number-input-clip_skip')
    expect(clipSkipInput).toBeInTheDocument()
    expect(screen.getByText('CLIP Skip')).toBeInTheDocument()
  })

  it('renders the sampler dropdown', () => {
    render(<GeneratorConfigSampling />, { wrapper: Wrapper })
    expect(screen.getByTestId('sampler-dropdown')).toBeInTheDocument()
  })
})
