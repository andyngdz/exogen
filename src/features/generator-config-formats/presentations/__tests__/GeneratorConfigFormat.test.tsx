import { UpscalerType } from '@/cores/constants'
import { createGeneratorConfigFormWrapper } from '@/cores/test-utils'
import { render, screen } from '@testing-library/react'
import { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { GeneratorConfigFormat } from '../GeneratorConfigFormat'

// Mock useConfig hook
vi.mock('@/cores/hooks', () => ({
  useConfig: vi.fn(() => ({
    upscalerOptions: [
      {
        value: UpscalerType.LANCZOS,
        name: 'Lanczos',
        description: 'High quality upscaler',
        suggested_denoise_strength: 0.5
      }
    ]
  }))
}))

// Mock the NumberInputController component
vi.mock('@/cores/presentations/NumberInputController', () => ({
  NumberInputController: ({
    'aria-label': ariaLabel,
    // control is unused in the mock but required by the component
    controlName,
    startContent
  }: {
    'aria-label': string
    controlName: string
    startContent: ReactNode
    [key: string]: unknown
  }) => (
    <div data-testid={`number-input-${controlName}`}>
      <span>{ariaLabel}</span>
      {startContent}
    </div>
  )
}))

const Wrapper = createGeneratorConfigFormWrapper()

describe('GeneratorConfigFormat', () => {
  it("should render the component with 'Format' heading", () => {
    render(<GeneratorConfigFormat />, { wrapper: Wrapper })

    expect(screen.getByText('Format')).toBeInTheDocument()
  })

  it('should render width and height number inputs', () => {
    render(<GeneratorConfigFormat />, { wrapper: Wrapper })

    expect(screen.getByTestId('number-input-width')).toBeInTheDocument()
    expect(screen.getByTestId('number-input-height')).toBeInTheDocument()

    // Check that labels are correctly rendered
    expect(screen.getByText('Width')).toBeInTheDocument()
    expect(screen.getByText('Height')).toBeInTheDocument()

    // Check that W and H labels are rendered
    expect(screen.getByText('W')).toBeInTheDocument()
    expect(screen.getByText('H')).toBeInTheDocument()
  })

  it('should render the hires_fix checkbox with label', () => {
    render(<GeneratorConfigFormat />, { wrapper: Wrapper })

    const hiresCheckbox = screen.getByRole('checkbox')
    expect(hiresCheckbox).toBeInTheDocument()
    expect(screen.getByText('Hires.fix')).toBeInTheDocument()
  })
})
