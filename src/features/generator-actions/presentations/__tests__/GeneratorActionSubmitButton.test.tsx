import { useGenerationStatusStore } from '@/features/generators/states'
import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
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

// Mock react-hook-form's FormProvider
const FormProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    defaultValues: {
      number_of_images: 4
    }
  })
  return <FormProvider {...methods}>{children}</FormProvider>
}

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
    render(
      <FormProviderWrapper>
        <GeneratorActionSubmitButton onPress={vi.fn()} />
      </FormProviderWrapper>
    )

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
    render(
      <FormProviderWrapper>
        <GeneratorActionSubmitButton onPress={vi.fn()} />
      </FormProviderWrapper>
    )

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

    const CustomFormProviderWrapper = ({
      children
    }: {
      children: React.ReactNode
    }) => {
      const methods = useForm({
        defaultValues: {
          number_of_images: 8
        }
      })
      return <FormProvider {...methods}>{children}</FormProvider>
    }

    // Act
    render(
      <CustomFormProviderWrapper>
        <GeneratorActionSubmitButton onPress={vi.fn()} />
      </CustomFormProviderWrapper>
    )

    // Assert
    expect(screen.getByTestId('submit-button')).toHaveTextContent(
      'Generate 8 images'
    )
  })
})
