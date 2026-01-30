import { ImageViewMode } from '@/features/generator-previewers/states/useImageViewModeStore'
import { ImageGenerationItem, ImageGenerationStepEndResponse } from '@/types'
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GeneratorPreviewer } from '../GeneratorPreviewer'
import * as imageViewModeStoreModule from '@/features/generator-previewers/states/useImageViewModeStore'
import * as generatorPreviewerModule from '@/features/generator-previewers/states'

// Mock the useImageViewModeStore
vi.mock('@/features/generator-previewers/states/useImageViewModeStore', () => ({
  useImageViewModeStore: vi.fn()
}))

// Mock the useGeneratorPreviewer hook
vi.mock('@/features/generator-previewers/states', () => ({
  useGeneratorPreviewer: vi.fn()
}))

// Mock the GeneratorPreviewerItem component
vi.mock('../GeneratorPreviewerItem', () => ({
  GeneratorPreviewerItem: ({
    imageStepEnd
  }: {
    imageStepEnd: ImageGenerationStepEndResponse
  }) => (
    <div data-testid="previewer-item" data-index={imageStepEnd.index}>
      Mock Item {imageStepEnd.index}
    </div>
  )
}))

// Mock the GeneratorPreviewerSlider component
vi.mock('../GeneratorPreviewerSlider', () => ({
  GeneratorPreviewerSlider: () => (
    <div data-testid="slider-component">Mock Slider</div>
  )
}))

// Mock Swiper components
vi.mock('swiper/react', () => ({
  Swiper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="swiper">{children}</div>
  ),
  SwiperSlide: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="swiper-slide">{children}</div>
  )
}))

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  useFormContext: () => ({
    watch: () => 512
  })
}))

// Mock next/image
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <div data-testid="next-image" data-src={src} data-alt={alt} />
  )
}))

describe('GeneratorPreviewer', () => {
  const mockImageStepEnds: ImageGenerationStepEndResponse[] = [
    {
      index: 0,
      image_base64: 'base64-image-0',
      current_step: 1,
      timestep: 0.5
    },
    {
      index: 1,
      image_base64: 'base64-image-1',
      current_step: 1,
      timestep: 0.5
    }
  ]

  // Mock items with proper type
  const mockItems: ImageGenerationItem[] = [
    { path: '', file_name: 'image-0.png' },
    { path: '', file_name: 'image-1.png' }
  ]

  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render grid view when viewMode is grid', () => {
    // Arrange
    const mockedViewModeStore = vi.mocked(
      imageViewModeStoreModule.useImageViewModeStore
    )
    const mockedPreviewerStore = vi.mocked(
      generatorPreviewerModule.useGeneratorPreviewer
    )

    mockedViewModeStore.mockReturnValue({
      viewMode: 'grid' as ImageViewMode,
      setViewMode: vi.fn()
    })

    mockedPreviewerStore.mockReturnValue({
      imageStepEnds: mockImageStepEnds,
      items: mockItems
    })

    // Act
    render(<GeneratorPreviewer />)

    // Assert
    expect(screen.queryByTestId('slider-component')).not.toBeInTheDocument()

    // Should have a grid container with the correct classes
    const gridContainer = screen.getByText(/Mock Item 0/).parentElement
    expect(gridContainer).toHaveClass('grid')
    expect(gridContainer).toHaveClass(
      'grid-cols-[repeat(auto-fill,minmax(256px,1fr))]'
    )
    expect(gridContainer).toHaveClass('gap-4')

    // Should render both preview items
    const previewItems = screen.getAllByTestId('previewer-item')
    expect(previewItems).toHaveLength(2)
    expect(previewItems[0]).toHaveAttribute('data-index', '0')
    expect(previewItems[1]).toHaveAttribute('data-index', '1')
  })

  it('should render slider view when viewMode is slider', () => {
    // Arrange
    const mockedViewModeStore = vi.mocked(
      imageViewModeStoreModule.useImageViewModeStore
    )
    const mockedPreviewerStore = vi.mocked(
      generatorPreviewerModule.useGeneratorPreviewer
    )

    mockedViewModeStore.mockReturnValue({
      viewMode: 'slider' as ImageViewMode,
      setViewMode: vi.fn()
    })

    mockedPreviewerStore.mockReturnValue({
      imageStepEnds: mockImageStepEnds,
      items: mockItems
    })

    // Act
    render(<GeneratorPreviewer />)

    // Assert
    expect(screen.getByTestId('slider-component')).toBeInTheDocument()
    expect(screen.queryByText(/Mock Item/)).not.toBeInTheDocument()
  })

  it('should handle empty state in grid view', () => {
    // Arrange
    const mockedViewModeStore = vi.mocked(
      imageViewModeStoreModule.useImageViewModeStore
    )
    const mockedPreviewerStore = vi.mocked(
      generatorPreviewerModule.useGeneratorPreviewer
    )

    mockedViewModeStore.mockReturnValue({
      viewMode: 'grid' as ImageViewMode,
      setViewMode: vi.fn()
    })

    mockedPreviewerStore.mockReturnValue({
      imageStepEnds: [],
      items: []
    })

    // Act
    render(<GeneratorPreviewer />)

    // Assert
    // In empty state, we should still have the grid container but with no children
    const gridContainer =
      screen.getByTestId('grid-container') || screen.getByRole('presentation')
    expect(gridContainer).toBeInTheDocument()
    expect(gridContainer).toHaveClass('grid')
    expect(gridContainer.children).toHaveLength(0)
  })
})
