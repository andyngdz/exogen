import { UpscalerType } from '@/cores/constants'
import { GeneratorConfigFormValues } from '@/features/generator-configs/types/generator-config'
import { render, screen } from '@testing-library/react'
import { ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
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

const MockFormProvider = ({ children }: { children: ReactNode }) => {
  const methods = useForm<GeneratorConfigFormValues>({
    defaultValues: {
      width: 512,
      height: 512,

      number_of_images: 1,
      steps: 20,
      cfg_scale: 7,
      seed: 0
    }
  })

  return <FormProvider {...methods}>{children}</FormProvider>
}

describe('GeneratorConfigFormat', () => {
  it("should render the component with 'Format' heading", () => {
    render(
      <MockFormProvider>
        <GeneratorConfigFormat />
      </MockFormProvider>
    )

    expect(screen.getByText('Format')).toBeInTheDocument()
  })

  it('should render width and height number inputs', () => {
    render(
      <MockFormProvider>
        <GeneratorConfigFormat />
      </MockFormProvider>
    )

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
    render(
      <MockFormProvider>
        <GeneratorConfigFormat />
      </MockFormProvider>
    )

    const hiresCheckbox = screen.getByRole('checkbox')
    expect(hiresCheckbox).toBeInTheDocument()
    expect(screen.getByText('Hires.fix')).toBeInTheDocument()
  })
})
