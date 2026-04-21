import { createGeneratorConfigFormWrapper } from '@/cores/test-utils'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GeneratorConfigExtra } from '../GeneratorConfigExtra'

// Mock the API queries
vi.mock('@/cores/api-queries', () => ({
  useLorasQuery: vi.fn(() => ({
    data: { loras: [] },
    isLoading: false,
    error: null
  }))
}))

const Wrapper = createGeneratorConfigFormWrapper()

describe('GeneratorConfigExtra', () => {
  it('should render the component with the correct header', () => {
    render(<GeneratorConfigExtra />, { wrapper: Wrapper })

    expect(screen.getByText('Extra')).toBeInTheDocument()
  })

  it('should render the add button', () => {
    render(<GeneratorConfigExtra />, { wrapper: Wrapper })

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('should render the Plus icon in the button', () => {
    const { container } = render(<GeneratorConfigExtra />, { wrapper: Wrapper })

    const iconElement = container.querySelector('svg')
    expect(iconElement).toBeInTheDocument()
  })

  it('should render the button as iconOnly', () => {
    render(<GeneratorConfigExtra />, { wrapper: Wrapper })

    const button = screen.getByRole('button')
    expect(button).not.toHaveTextContent(/\S/)
  })
})
