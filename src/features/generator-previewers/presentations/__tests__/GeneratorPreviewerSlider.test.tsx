import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGeneratorPreviewer } from '../../states'
import { GeneratorPreviewerSlider } from '../GeneratorPreviewerSlider'

// Mock HeroUI ScrollShadow to avoid framer-motion (window access) in tests.
vi.mock('@heroui/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@heroui/react')>()
  return {
    ...actual,
    Button: ({
      children,
      onPress,
      isDisabled,
      className,
      'aria-label': ariaLabel
    }: {
      children: ReactNode
      onPress?: VoidFunction
      isDisabled?: boolean
      className?: string
      'aria-label'?: string
    }) => (
      <button
        type="button"
        onClick={onPress}
        disabled={isDisabled}
        className={className}
        aria-label={ariaLabel}
      >
        {children}
      </button>
    ),
    ScrollShadow: ({
      children,
      className
    }: {
      children: ReactNode
      className?: string
    }) => <div className={className}>{children}</div>
  }
})

// Mock the useGeneratorPreviewer hook
vi.mock('@/features/generator-previewers/states', () => ({
  useGeneratorPreviewer: vi.fn()
}))

// Mock GeneratorPreviewerItem component
vi.mock('../GeneratorPreviewerItem', () => ({
  GeneratorPreviewerItem: ({
    imageStepEnd
  }: {
    imageStepEnd: { index: number }
  }) => (
    <div data-testid={`previewer-item-${imageStepEnd.index}`}>
      Item {imageStepEnd.index}
    </div>
  )
}))

// Mock SwiperJS components and hooks
const mockSlideNext = vi.fn()
const mockSlidePrev = vi.fn()

vi.mock('swiper/react', () => ({
  Swiper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="swiper" className="swiper-container">
      {children}
    </div>
  ),
  SwiperSlide: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="swiper-slide" className="swiper-slide">
      {children}
    </div>
  ),
  useSwiper: () => ({
    slideNext: mockSlideNext,
    slidePrev: mockSlidePrev
  })
}))

// Mock Swiper modules
vi.mock('swiper/modules', () => ({
  Mousewheel: {},
  Keyboard: {}
}))

// Mock Swiper CSS imports
vi.mock('swiper/css', () => ({}))

// Mock GeneratorPreviewerSliderActions
vi.mock('../GeneratorPreviewerSliderActions', () => ({
  GeneratorPreviewerSliderActions: () => (
    <div data-testid="slider-actions">
      <button
        data-testid="prev-button"
        aria-label="Previous image"
        onClick={() => mockSlidePrev()}
      >
        Previous
      </button>
      <button
        data-testid="next-button"
        aria-label="Next image"
        onClick={() => mockSlideNext()}
      >
        Next
      </button>
    </div>
  )
}))

describe('GeneratorPreviewerSlider', () => {
  const mockUseGeneratorPreviewer = vi.mocked(useGeneratorPreviewer)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('empty state', () => {
    it('should render empty state when no images are available', () => {
      mockUseGeneratorPreviewer.mockReturnValue({
        imageStepEnds: [],
        items: []
      })

      render(<GeneratorPreviewerSlider />)

      expect(screen.getByText('No images to display')).toBeInTheDocument()
      expect(screen.queryByTestId('swiper')).not.toBeInTheDocument()
    })

    it('should apply correct styling for empty state', () => {
      mockUseGeneratorPreviewer.mockReturnValue({
        imageStepEnds: [],
        items: []
      })

      render(<GeneratorPreviewerSlider />)

      const emptyState = screen.getByText('No images to display')
      expect(emptyState).toHaveClass(
        'flex',
        'justify-center',
        'items-center',
        'text-default-700'
      )
    })
  })

  describe('with images', () => {
    const mockImageStepEnds = [
      {
        index: 0,
        current_step: 10,
        timestep: 100,
        image_base64: 'base64-image-1'
      },
      {
        index: 1,
        current_step: 20,
        timestep: 200,
        image_base64: 'base64-image-2'
      },
      {
        index: 2,
        current_step: 30,
        timestep: 300,
        image_base64: 'base64-image-3'
      }
    ]

    beforeEach(() => {
      mockUseGeneratorPreviewer.mockReturnValue({
        imageStepEnds: mockImageStepEnds,
        items: []
      })
    })

    it('should render swiper container with images', () => {
      render(<GeneratorPreviewerSlider />)

      expect(screen.getByTestId('swiper')).toBeInTheDocument()
      expect(screen.getAllByTestId('swiper-slide')).toHaveLength(3)
    })

    it('should render each image in a slide', () => {
      render(<GeneratorPreviewerSlider />)

      mockImageStepEnds.forEach((imageStepEnd) => {
        expect(
          screen.getByTestId(`previewer-item-${imageStepEnd.index}`)
        ).toBeInTheDocument()
        expect(
          screen.getByText(`Item ${imageStepEnd.index}`)
        ).toBeInTheDocument()
      })
    })

    it('should render slider actions', () => {
      render(<GeneratorPreviewerSlider />)

      expect(screen.getByLabelText('Previous image')).toBeInTheDocument()
      expect(screen.getByLabelText('Next image')).toBeInTheDocument()
    })

    it('should have correct container styling', () => {
      render(<GeneratorPreviewerSlider />)

      const container = screen.getByTestId('swiper').parentElement
      expect(container).toHaveClass('p-4', 'relative')
    })
  })

  describe('slider navigation', () => {
    beforeEach(() => {
      mockUseGeneratorPreviewer.mockReturnValue({
        imageStepEnds: [
          { index: 0, current_step: 10, timestep: 100, image_base64: 'img1' },
          { index: 1, current_step: 20, timestep: 200, image_base64: 'img2' }
        ],
        items: []
      })
    })

    it('should call slideNext when next button is clicked', () => {
      render(<GeneratorPreviewerSlider />)

      const nextButton = screen.getByLabelText('Next image')
      fireEvent.click(nextButton)

      expect(mockSlideNext).toHaveBeenCalledTimes(1)
    })

    it('should call slidePrev when previous button is clicked', () => {
      render(<GeneratorPreviewerSlider />)

      const prevButton = screen.getByLabelText('Previous image')
      fireEvent.click(prevButton)

      expect(mockSlidePrev).toHaveBeenCalledTimes(1)
    })
  })

  describe('accessibility', () => {
    beforeEach(() => {
      mockUseGeneratorPreviewer.mockReturnValue({
        imageStepEnds: [
          { index: 0, current_step: 10, timestep: 100, image_base64: 'img1' },
          { index: 1, current_step: 20, timestep: 200, image_base64: 'img2' }
        ],
        items: []
      })
    })

    it('should have proper aria labels for navigation buttons', () => {
      render(<GeneratorPreviewerSlider />)

      expect(screen.getByLabelText('Previous image')).toBeInTheDocument()
      expect(screen.getByLabelText('Next image')).toBeInTheDocument()
    })
  })

  describe('memoization', () => {
    it('should memoize slides based on imageStepEnds', () => {
      const imageStepEnds = [
        { index: 0, current_step: 10, timestep: 100, image_base64: 'img1' }
      ]

      mockUseGeneratorPreviewer.mockReturnValue({
        imageStepEnds,
        items: []
      })

      const { rerender } = render(<GeneratorPreviewerSlider />)

      expect(screen.getByTestId('previewer-item-0')).toBeInTheDocument()

      // Re-render with same data - should use memoized result
      rerender(<GeneratorPreviewerSlider />)

      expect(screen.getByTestId('previewer-item-0')).toBeInTheDocument()
    })

    it('should update slides when imageStepEnds changes', () => {
      // Initial render with one image
      mockUseGeneratorPreviewer.mockReturnValue({
        imageStepEnds: [
          { index: 0, current_step: 10, timestep: 100, image_base64: 'img1' }
        ],
        items: []
      })

      const { rerender } = render(<GeneratorPreviewerSlider />)

      expect(screen.getByTestId('previewer-item-0')).toBeInTheDocument()
      expect(screen.queryByTestId('previewer-item-1')).not.toBeInTheDocument()

      // Update with two images
      mockUseGeneratorPreviewer.mockReturnValue({
        imageStepEnds: [
          { index: 0, current_step: 10, timestep: 100, image_base64: 'img1' },
          { index: 1, current_step: 20, timestep: 200, image_base64: 'img2' }
        ],
        items: []
      })

      rerender(<GeneratorPreviewerSlider />)

      expect(screen.getByTestId('previewer-item-0')).toBeInTheDocument()
      expect(screen.getByTestId('previewer-item-1')).toBeInTheDocument()
    })
  })

  describe('swiper configuration', () => {
    beforeEach(() => {
      mockUseGeneratorPreviewer.mockReturnValue({
        imageStepEnds: [
          { index: 0, current_step: 10, timestep: 100, image_base64: 'img1' },
          { index: 1, current_step: 20, timestep: 200, image_base64: 'img2' }
        ],
        items: []
      })
    })

    it('should render swiper with correct structure', () => {
      render(<GeneratorPreviewerSlider />)

      const swiper = screen.getByTestId('swiper')
      expect(swiper).toHaveClass('swiper-container')

      const slides = screen.getAllByTestId('swiper-slide')
      expect(slides).toHaveLength(2)
      slides.forEach((slide) => {
        expect(slide).toHaveClass('swiper-slide')
      })
    })
  })
})
