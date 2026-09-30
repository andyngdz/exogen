import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createStoreSelectorMock } from '@/cores/test-utils'
import { useUseImageGenerationStore } from '@/features/generators'
import { useGeneratorPhotoviewStore } from '../../states/useGeneratorPhotoviewStore'
import { GeneratorPhotoviewCarousel } from '../GeneratorPhotoviewCarousel'

const { mockSlideToLoop } = vi.hoisted(() => ({ mockSlideToLoop: vi.fn() }))

vi.mock('@/features/generators')

vi.mock('next/image', async () => {
  const { mockNextImage } = await import('@/cores/test-utils')
  return mockNextImage()
})

vi.mock('swiper/react', () => ({
  Swiper: ({
    children,
    loop,
    initialSlide,
    onSlideChange
  }: {
    children: React.ReactNode
    loop: boolean
    initialSlide: number
    onSlideChange?: (swiper: { realIndex: number }) => void
  }) => (
    <div
      data-testid="swiper"
      data-loop={String(loop)}
      data-initial-slide={String(initialSlide)}
    >
      <button
        type="button"
        data-testid="trigger-slide-change"
        onClick={() => onSlideChange?.({ realIndex: 1 })}
      >
        Trigger slide change
      </button>
      {children}
    </div>
  ),
  SwiperSlide: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="swiper-slide">{children}</div>
  ),
  useSwiper: () => ({
    slidePrev: vi.fn(),
    slideNext: vi.fn(),
    slideToLoop: mockSlideToLoop
  })
}))

vi.mock('swiper/modules', () => ({
  Keyboard: {},
  Mousewheel: {}
}))

describe('GeneratorPhotoviewCarousel', () => {
  beforeEach(() => {
    useGeneratorPhotoviewStore.setState({ isOpen: false, currentIndex: 0 })
  })

  it('should render swiper with all image slides', () => {
    vi.mocked(useUseImageGenerationStore).mockImplementation(
      createStoreSelectorMock({
        items: [
          { path: 'images/a.png', file_name: 'a.png' },
          { path: 'images/b.png', file_name: 'b.png' },
          { path: 'images/c.png', file_name: 'c.png' }
        ]
      })
    )

    render(<GeneratorPhotoviewCarousel initialIndex={0} />)

    expect(screen.getAllByTestId('swiper-slide')).toHaveLength(3)
  })

  it('should enable loop mode with multiple images', () => {
    vi.mocked(useUseImageGenerationStore).mockImplementation(
      createStoreSelectorMock({
        items: [
          { path: 'images/a.png', file_name: 'a.png' },
          { path: 'images/b.png', file_name: 'b.png' }
        ]
      })
    )

    render(<GeneratorPhotoviewCarousel initialIndex={0} />)

    expect(screen.getByTestId('swiper')).toHaveAttribute('data-loop', 'true')
  })

  it('should disable loop mode with single image', () => {
    vi.mocked(useUseImageGenerationStore).mockImplementation(
      createStoreSelectorMock({
        items: [{ path: 'images/a.png', file_name: 'a.png' }]
      })
    )

    render(<GeneratorPhotoviewCarousel initialIndex={0} />)

    expect(screen.getByTestId('swiper')).toHaveAttribute('data-loop', 'false')
  })

  it('should clamp initial index', () => {
    vi.mocked(useUseImageGenerationStore).mockImplementation(
      createStoreSelectorMock({
        items: [
          { path: 'images/a.png', file_name: 'a.png' },
          { path: 'images/b.png', file_name: 'b.png' }
        ]
      })
    )

    render(<GeneratorPhotoviewCarousel initialIndex={999} />)

    expect(screen.getByTestId('swiper')).toHaveAttribute(
      'data-initial-slide',
      '1'
    )
  })

  it('updates current index when slide changes', () => {
    vi.mocked(useUseImageGenerationStore).mockImplementation(
      createStoreSelectorMock({
        items: [
          { path: 'images/a.png', file_name: 'a.png' },
          { path: 'images/b.png', file_name: 'b.png' }
        ]
      })
    )

    render(<GeneratorPhotoviewCarousel initialIndex={0} />)

    fireEvent.click(screen.getByTestId('trigger-slide-change'))

    expect(useGeneratorPhotoviewStore.getState().currentIndex).toBe(1)
  })
  it('jumps to an image from its thumbnail and marks the current one', () => {
    useGeneratorPhotoviewStore.setState({ currentIndex: 1 })
    vi.mocked(useUseImageGenerationStore).mockImplementation(
      createStoreSelectorMock({
        items: [
          { path: 'images/a.png', file_name: 'a.png' },
          { path: 'images/b.png', file_name: 'b.png' },
          { path: 'images/c.png', file_name: 'c.png' }
        ]
      })
    )

    render(<GeneratorPhotoviewCarousel initialIndex={0} />)

    expect(
      screen.getByRole('button', { name: 'Show image 2' })
    ).toHaveAttribute('aria-current', 'true')

    fireEvent.click(screen.getByRole('button', { name: 'Show image 3' }))

    expect(mockSlideToLoop).toHaveBeenCalledWith(2)
  })

  it('shows no thumbnails for a single image', () => {
    vi.mocked(useUseImageGenerationStore).mockImplementation(
      createStoreSelectorMock({
        items: [{ path: 'images/a.png', file_name: 'a.png' }]
      })
    )

    render(<GeneratorPhotoviewCarousel initialIndex={0} />)

    expect(screen.queryByRole('button', { name: /show image/i })).toBeNull()
  })
})
