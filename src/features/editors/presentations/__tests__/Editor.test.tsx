import { createQueryClientWrapper } from '@/cores/test-utils'
import * as matchers from '@testing-library/jest-dom/matchers'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Editor } from '../Editor'

expect.extend(matchers)

vi.mock('@/features/model-selectors/presentations/ModelSelector', () => ({
  ModelSelector: () => <div data-testid="mock-model-selector">Model</div>
}))

// Mock the Generator component to avoid network requests and resizable panel issues
vi.mock('@/features/generators/presentations/Generator', () => ({
  Generator: () => <div data-testid="mock-generator">Generator</div>
}))

// Mock the ModelLoadProgressBar component
vi.mock(
  '@/features/model-load-progress/presentations/ModelLoadProgressBar',
  () => ({
    ModelLoadProgressBar: () => (
      <div data-testid="mock-model-load-progress-bar">
        Model Load Progress Bar
      </div>
    )
  })
)

describe('Editor', () => {
  it('renders all components', () => {
    render(<Editor />, { wrapper: createQueryClientWrapper() })

    expect(screen.getByTestId('mock-model-selector')).toBeInTheDocument()
    expect(
      screen.getByTestId('mock-model-load-progress-bar')
    ).toBeInTheDocument()
    expect(screen.getByTestId('mock-generator')).toBeInTheDocument()
  })

  it('renders with proper structure and CSS classes', () => {
    const { container } = render(<Editor />, {
      wrapper: createQueryClientWrapper()
    })

    // Check that there's a wrapping div with correct classes
    const wrapperDiv = container.firstChild
    expect(wrapperDiv).toBeInTheDocument()
    expect(wrapperDiv).toHaveClass('flex', 'flex-col', 'h-full', 'w-full')
  })
})
