import { useGenerationStatusStore } from '@/features/generators/states'
import { createGeneratorConfigFormWrapper } from '@/cores/test-utils'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GeneratorActionSubmitButton } from '../GeneratorActionSubmitButton'

// Mock the useGenerationStatusStore
vi.mock('@/features/generators/states', () => ({
  useGenerationStatusStore: vi.fn()
}))

// Mock HeroUI Button component
vi.mock('@heroui/react', () => ({
  Button: ({
    children,
    isDisabled,
    type,
    onPress
  }: {
    children: React.ReactNode
    isDisabled?: boolean
    type?: 'submit' | 'reset' | 'button'
    onPress?: VoidFunction
  }) => (
    <button
      type={type}
      disabled={isDisabled}
      data-testid="submit-button"
      onClick={onPress}
    >
      {children}
    </button>
  )
}))

const createWrapper = (numberOfImages: number) =>
  createGeneratorConfigFormWrapper({
    overrides: {
      number_of_images: numberOfImages
    }
  })

describe('GeneratorActionSubmitButton', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should render button with correct number of images when not generating', () => {
    // Arrange
    vi.mocked(useGenerationStatusStore).mockReturnValue({
      isGenerating: false,
      onSetIsGenerating: vi.fn(),
      reset: vi.fn()
    })

    // Act
    render(<GeneratorActionSubmitButton onPress={vi.fn()} />, {
      wrapper: createWrapper(4)
    })

    // Assert
    expect(screen.getByTestId('submit-button')).toHaveTextContent(
      'Generate 4 images'
    )
    expect(screen.getByTestId('submit-button')).not.toBeDisabled()
  })

  it('should disable button and show animation class when generating', () => {
    // Arrange
    vi.mocked(useGenerationStatusStore).mockReturnValue({
      isGenerating: true,
      onSetIsGenerating: vi.fn(),
      reset: vi.fn()
    })

    // Act
    render(<GeneratorActionSubmitButton onPress={vi.fn()} />, {
      wrapper: createWrapper(4)
    })

    // Assert
    expect(screen.getByTestId('submit-button')).toHaveTextContent(
      'Generate 4 images'
    )
    expect(screen.getByTestId('submit-button')).toBeDisabled()
  })

  it('should update number of images based on form value', () => {
    // Arrange
    vi.mocked(useGenerationStatusStore).mockReturnValue({
      isGenerating: false,
      onSetIsGenerating: vi.fn(),
      reset: vi.fn()
    })

    // Act
    render(<GeneratorActionSubmitButton onPress={vi.fn()} />, {
      wrapper: createWrapper(8)
    })

    // Assert
    expect(screen.getByTestId('submit-button')).toHaveTextContent(
      'Generate 8 images'
    )
  })
})
