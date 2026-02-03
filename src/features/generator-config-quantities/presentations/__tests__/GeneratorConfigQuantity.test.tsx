import { createGeneratorConfigFormWrapper } from '@/cores/test-utils'
import { render, screen } from '@testing-library/react'
import { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { GeneratorConfigQuantity } from '../GeneratorConfigQuantity'

// Mock the NumberInputController component
vi.mock('@/cores/presentations/NumberInputController', () => ({
  NumberInputController: ({
    'aria-label': ariaLabel,
    controlName,
    startContent,
    endContent
  }: {
    'aria-label': string
    controlName: string
    startContent: ReactNode
    endContent: ReactNode
    [key: string]: unknown
  }) => (
    <div data-testid={`number-input-${controlName}`}>
      <span>{ariaLabel}</span>
      {startContent}
      <div data-testid="end-content">{endContent}</div>
    </div>
  )
}))

// Mock the Tooltip component from @heroui/react
vi.mock('@heroui/react', () => ({
  Tooltip: ({
    content,
    children
  }: {
    content: string
    children: ReactNode
  }) => (
    <div data-testid="tooltip" data-tooltip-content={content}>
      {children}
    </div>
  )
}))

const Wrapper = createGeneratorConfigFormWrapper()

describe('GeneratorConfigQuantity', () => {
  it("should render the component with 'Quantity' heading", () => {
    render(<GeneratorConfigQuantity />, { wrapper: Wrapper })

    expect(screen.getByText('Quantity')).toBeInTheDocument()
  })

  it('should render number input for number_of_images', () => {
    render(<GeneratorConfigQuantity />, { wrapper: Wrapper })

    expect(
      screen.getByTestId('number-input-number_of_images')
    ).toBeInTheDocument()
    expect(screen.getByText('Number of images')).toBeInTheDocument()
    expect(screen.getByText('Images')).toBeInTheDocument()
  })

  it('should render tooltip with correct content', () => {
    render(<GeneratorConfigQuantity />, { wrapper: Wrapper })

    const tooltip = screen.getByTestId('tooltip')
    expect(tooltip).toBeInTheDocument()
    expect(tooltip).toHaveAttribute(
      'data-tooltip-content',
      'Number of images will be generated'
    )
  })
})
