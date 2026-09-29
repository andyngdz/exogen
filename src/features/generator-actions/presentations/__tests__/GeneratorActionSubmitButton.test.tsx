import { useGenerationStatusStore } from '@/features/generators/states'
import {
  createGeneratorConfigFormWrapper,
  createStoreSelectorMock
} from '@/cores/test-utils'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GeneratorActionSubmitButton } from '../GeneratorActionSubmitButton'

// Mock the useGenerationStatusStore
vi.mock('@/features/generators/states', () => ({
  useGenerationStatusStore: vi.fn()
}))

const createWrapper = (numberOfImages: number) =>
  createGeneratorConfigFormWrapper({
    overrides: {
      number_of_images: numberOfImages
    }
  })

const mockGenerating = (isGenerating: boolean) => {
  vi.mocked(useGenerationStatusStore).mockImplementation(
    createStoreSelectorMock({
      isGenerating,
      onSetIsGenerating: vi.fn(),
      reset: vi.fn()
    })
  )
}

describe('GeneratorActionSubmitButton', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should render button with correct number of images when not generating', () => {
    mockGenerating(false)

    render(<GeneratorActionSubmitButton onPress={vi.fn()} />, {
      wrapper: createWrapper(4)
    })

    const button = screen.getByRole('button', { name: 'Generate 4 images' })
    expect(button).toBeEnabled()
  })

  it('should disable button when generating', () => {
    mockGenerating(true)

    render(<GeneratorActionSubmitButton onPress={vi.fn()} />, {
      wrapper: createWrapper(4)
    })

    expect(
      screen.getByRole('button', { name: 'Generate 4 images' })
    ).toBeDisabled()
  })

  it('should update number of images based on form value', () => {
    mockGenerating(false)

    render(<GeneratorActionSubmitButton onPress={vi.fn()} />, {
      wrapper: createWrapper(8)
    })

    expect(
      screen.getByRole('button', { name: 'Generate 8 images' })
    ).toBeInTheDocument()
  })
})
