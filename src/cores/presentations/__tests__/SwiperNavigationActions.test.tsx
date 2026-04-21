import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SwiperNavigationActions } from '../SwiperNavigationActions'

// Mock the useSwiper hook
const mockSlideNext = vi.fn()
const mockSlidePrev = vi.fn()

vi.mock('swiper/react', () => ({
  useSwiper: () => ({
    slideNext: mockSlideNext,
    slidePrev: mockSlidePrev
  })
}))

// Mock HeroUI Button component
vi.mock('@heroui/react', () => ({
  Button: ({
    children,
    onPress,
    isIconOnly,
    variant,
    color,
    className,
    'aria-label': ariaLabel
  }: {
    children: React.ReactNode
    onPress?: () => void
    isIconOnly?: boolean
    variant?: string
    color?: string
    className?: string
    'aria-label'?: string
  }) => (
    <button
      onClick={onPress}
      data-icon-only={isIconOnly}
      data-variant={variant}
      data-color={color}
      className={className}
      aria-label={ariaLabel}
      data-testid={
        ariaLabel?.includes('Previous') ? 'prev-button' : 'next-button'
      }
    >
      {children}
    </button>
  )
}))

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  ChevronLeftIcon: () => (
    <svg data-testid="chevron-left-icon" width="16" height="16">
      <title>Previous</title>
    </svg>
  ),
  ChevronRightIcon: () => (
    <svg data-testid="chevron-right-icon" width="16" height="16">
      <title>Next</title>
    </svg>
  )
}))

describe('SwiperNavigationActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('component rendering', () => {
    it('should render both navigation buttons', () => {
      render(<SwiperNavigationActions />)

      expect(screen.getByTestId('prev-button')).toBeInTheDocument()
      expect(screen.getByTestId('next-button')).toBeInTheDocument()
    })

    it('should render correct icons in buttons', () => {
      render(<SwiperNavigationActions />)

      expect(screen.getByTestId('chevron-left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument()
    })

    it('should have correct container styling', () => {
      render(<SwiperNavigationActions />)

      const container = screen.getByTestId('prev-button').parentElement
      expect(container).toHaveClass(
        'absolute',
        'inset-4',
        'flex',
        'items-center',
        'justify-between'
      )
    })
  })

  describe('button properties', () => {
    it('should render buttons with correct HeroUI properties', () => {
      render(<SwiperNavigationActions />)

      const prevButton = screen.getByTestId('prev-button')
      const nextButton = screen.getByTestId('next-button')

      // Check button properties
      expect(prevButton).toHaveAttribute('data-icon-only', 'true')
      expect(prevButton).toHaveAttribute('data-variant', 'flat')
      expect(prevButton).toHaveAttribute('data-color', 'default')
      expect(prevButton).toHaveClass('z-10')

      expect(nextButton).toHaveAttribute('data-icon-only', 'true')
      expect(nextButton).toHaveAttribute('data-variant', 'flat')
      expect(nextButton).toHaveAttribute('data-color', 'default')
      expect(nextButton).toHaveClass('z-10')
    })
  })

  describe('navigation functionality', () => {
    it('should call swiper.slidePrev when previous button is clicked', () => {
      render(<SwiperNavigationActions />)

      const prevButton = screen.getByTestId('prev-button')
      fireEvent.click(prevButton)

      expect(mockSlidePrev).toHaveBeenCalledTimes(1)
      expect(mockSlideNext).not.toHaveBeenCalled()
    })

    it('should call swiper.slideNext when next button is clicked', () => {
      render(<SwiperNavigationActions />)

      const nextButton = screen.getByTestId('next-button')
      fireEvent.click(nextButton)

      expect(mockSlideNext).toHaveBeenCalledTimes(1)
      expect(mockSlidePrev).not.toHaveBeenCalled()
    })

    it('should handle multiple clicks correctly', () => {
      render(<SwiperNavigationActions />)

      const prevButton = screen.getByTestId('prev-button')
      const nextButton = screen.getByTestId('next-button')

      // Click previous multiple times
      fireEvent.click(prevButton)
      fireEvent.click(prevButton)
      fireEvent.click(prevButton)

      expect(mockSlidePrev).toHaveBeenCalledTimes(3)

      // Click next multiple times
      fireEvent.click(nextButton)
      fireEvent.click(nextButton)

      expect(mockSlideNext).toHaveBeenCalledTimes(2)
    })

    it('should call correct functions for each button independently', () => {
      render(<SwiperNavigationActions />)

      const prevButton = screen.getByTestId('prev-button')
      const nextButton = screen.getByTestId('next-button')

      // Alternate clicking
      fireEvent.click(prevButton)
      fireEvent.click(nextButton)
      fireEvent.click(prevButton)
      fireEvent.click(nextButton)

      expect(mockSlidePrev).toHaveBeenCalledTimes(2)
      expect(mockSlideNext).toHaveBeenCalledTimes(2)
    })
  })

  describe('accessibility', () => {
    it('should have proper aria-label for previous button', () => {
      render(<SwiperNavigationActions />)

      const prevButton = screen.getByTestId('prev-button')
      expect(prevButton).toHaveAttribute('aria-label', 'Previous')
    })

    it('should have proper aria-label for next button', () => {
      render(<SwiperNavigationActions />)

      const nextButton = screen.getByTestId('next-button')
      expect(nextButton).toHaveAttribute('aria-label', 'Next')
    })

    it('should be accessible via aria-label queries', () => {
      render(<SwiperNavigationActions />)

      expect(screen.getByLabelText('Previous')).toBeInTheDocument()
      expect(screen.getByLabelText('Next')).toBeInTheDocument()
    })

    it('should have icon titles for screen readers', () => {
      render(<SwiperNavigationActions />)

      expect(screen.getByTitle('Previous')).toBeInTheDocument()
      expect(screen.getByTitle('Next')).toBeInTheDocument()
    })
  })

  describe('swiper integration', () => {
    it('should use swiper instance from useSwiper hook', () => {
      render(<SwiperNavigationActions />)

      // The component should render without errors, indicating successful hook usage
      expect(screen.getByTestId('prev-button')).toBeInTheDocument()
      expect(screen.getByTestId('next-button')).toBeInTheDocument()
    })

    it('should handle onPrevious function correctly', () => {
      render(<SwiperNavigationActions />)

      const prevButton = screen.getByTestId('prev-button')

      // Test that the onPrevious function is properly bound
      fireEvent.click(prevButton)

      expect(mockSlidePrev).toHaveBeenCalledTimes(1)
    })

    it('should handle onNext function correctly', () => {
      render(<SwiperNavigationActions />)

      const nextButton = screen.getByTestId('next-button')

      // Test that the onNext function is properly bound
      fireEvent.click(nextButton)

      expect(mockSlideNext).toHaveBeenCalledTimes(1)
    })
  })

  describe('component structure', () => {
    it('should have correct DOM structure', () => {
      render(<SwiperNavigationActions />)

      const container = screen.getByTestId('prev-button').parentElement
      const buttons = container?.querySelectorAll('button')

      expect(container?.tagName).toBe('DIV')
      expect(buttons).toHaveLength(2)
    })

    it('should position buttons at opposite ends of container', () => {
      render(<SwiperNavigationActions />)

      const container = screen.getByTestId('prev-button').parentElement
      expect(container).toHaveClass('justify-between')
    })

    it('should center buttons vertically in container', () => {
      render(<SwiperNavigationActions />)

      const container = screen.getByTestId('prev-button').parentElement
      expect(container).toHaveClass('items-center')
    })

    it('should have proper z-index for overlay positioning', () => {
      render(<SwiperNavigationActions />)

      const prevButton = screen.getByTestId('prev-button')
      const nextButton = screen.getByTestId('next-button')

      expect(prevButton).toHaveClass('z-10')
      expect(nextButton).toHaveClass('z-10')
    })
  })

  describe('edge cases', () => {
    it('should handle rapid successive clicks', () => {
      render(<SwiperNavigationActions />)

      const nextButton = screen.getByTestId('next-button')

      // Simulate rapid clicking
      for (let i = 0; i < 10; i++) {
        fireEvent.click(nextButton)
      }

      expect(mockSlideNext).toHaveBeenCalledTimes(10)
    })

    it('should maintain button state after interactions', () => {
      render(<SwiperNavigationActions />)

      const prevButton = screen.getByTestId('prev-button')
      const nextButton = screen.getByTestId('next-button')

      fireEvent.click(prevButton)

      // Buttons should still be present and functional after interaction
      expect(prevButton).toBeInTheDocument()
      expect(nextButton).toBeInTheDocument()

      fireEvent.click(nextButton)

      expect(mockSlidePrev).toHaveBeenCalledTimes(1)
      expect(mockSlideNext).toHaveBeenCalledTimes(1)
    })
  })
})
