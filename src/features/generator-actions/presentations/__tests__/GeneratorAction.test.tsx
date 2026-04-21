import { ImageViewMode } from '@/features/generator-previewers/states/useImageViewModeStore'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GeneratorAction } from '../GeneratorAction'

// Mock the useImageViewModeStore
vi.mock('@/features/generator-previewers/states/useImageViewModeStore', () => {
  const setViewMode = vi.fn()
  return {
    useImageViewModeStore: vi.fn(() => ({
      viewMode: 'grid' as ImageViewMode,
      setViewMode
    }))
  }
})

// Mock the GeneratorActionSubmitButton component
vi.mock('../GeneratorActionSubmitButton', () => ({
  GeneratorActionSubmitButton: () => (
    <div data-testid="submit-button-mock">Submit Button</div>
  )
}))

// Mock HeroUI components
vi.mock('@heroui/react', () => {
  const mockSelectionChange = vi.fn()
  return {
    Select: ({
      children,
      className,
      selectedKeys,
      onSelectionChange,
      'aria-label': ariaLabel
    }: {
      children: React.ReactNode
      className?: string
      selectedKeys?: string[]
      onSelectionChange?: (keys: Set<string>) => void
      'aria-label'?: string
    }) => {
      // Store the onSelectionChange callback for testing
      if (onSelectionChange) {
        mockSelectionChange.mockImplementation(onSelectionChange)
      }

      return (
        <div
          data-testid="select-mock"
          className={className}
          aria-label={ariaLabel}
          onClick={() => mockSelectionChange(new Set(['slider']))}
        >
          {selectedKeys && (
            <span data-testid="selected-key">{selectedKeys[0]}</span>
          )}
          {children}
        </div>
      )
    },
    SelectItem: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="select-item">{children}</div>
    ),
    Selection: Set
  }
})

describe('GeneratorAction', () => {
  const setViewModeMock = vi.fn()

  beforeEach(async () => {
    // Reset the mock before each test
    setViewModeMock.mockReset()

    // Update the mock implementation for useImageViewModeStore
    const storeModule =
      await import('@/features/generator-previewers/states/useImageViewModeStore')
    const mockedStore = vi.mocked(storeModule.useImageViewModeStore)
    mockedStore.mockImplementation(() => ({
      viewMode: 'grid' as ImageViewMode,
      setViewMode: setViewModeMock
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render the component with submit button and view selector', () => {
    // Arrange & Act
    render(<GeneratorAction onGenerate={vi.fn()} />)

    // Assert
    expect(screen.getByTestId('submit-button-mock')).toBeInTheDocument()
    expect(screen.getByTestId('select-mock')).toBeInTheDocument()
    expect(screen.getByTestId('selected-key')).toHaveTextContent('grid')

    // Check for SelectItem content
    const selectItems = screen.getAllByTestId('select-item')
    expect(selectItems).toHaveLength(2)
    expect(selectItems[0]).toHaveTextContent('Grid View')
    expect(selectItems[1]).toHaveTextContent('Slider View')
  })

  it('should have the correct CSS classes and attributes', () => {
    // Arrange & Act
    render(<GeneratorAction onGenerate={vi.fn()} />)

    // Assert
    expect(screen.getByTestId('select-mock')).toHaveClass('max-w-32')
    expect(screen.getByTestId('select-mock')).toHaveAttribute(
      'aria-label',
      'View'
    )
  })

  it('should change view mode when selection changes', async () => {
    // Arrange
    render(<GeneratorAction onGenerate={vi.fn()} />)
    const select = screen.getByTestId('select-mock')

    // Act
    await userEvent.click(select)

    // Assert
    expect(setViewModeMock).toHaveBeenCalledWith('slider')
  })
})
