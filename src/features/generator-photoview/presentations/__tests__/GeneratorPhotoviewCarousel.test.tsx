import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useUseImageGenerationStore } from '@/features/generators'
import { GeneratorPhotoviewCarousel } from '../GeneratorPhotoviewCarousel'

vi.mock('@/features/generators')

vi.mock('next/image', async () => {
  const { mockNextImage } = await import('@/cores/test-utils')
  return mockNextImage()
})

vi.mock('swiper/react', () => ({
  Swiper: ({
    children,
    loop,
    initialSlide
  }: {
    children: React.ReactNode
    loop: boolean
    initialSlide: number
  }) => (
    <div
      data-testid="swiper"
      data-loop={String(loop)}
      data-initial-slide={String(initialSlide)}
    >
      {children}
    </div>
  ),
  SwiperSlide: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="swiper-slide">{children}</div>
  ),
  useSwiper: () => ({
    slidePrev: vi.fn(),
    slideNext: vi.fn()
  })
}))

vi.mock('swiper/modules', () => ({
  Keyboard: {},
  Mousewheel: {}
}))

describe('GeneratorPhotoviewCarousel', () => {
  it('should render swiper with all image slides', () => {
    vi.mocked(useUseImageGenerationStore).mockReturnValue({
      items: [
        { path: 'images/a.png', file_name: 'a.png' },
        { path: 'images/b.png', file_name: 'b.png' },
        { path: 'images/c.png', file_name: 'c.png' }
      ]
    } as never)

    render(<GeneratorPhotoviewCarousel initialIndex={0} />)

    expect(screen.getAllByTestId('swiper-slide')).toHaveLength(3)
  })

  it('should enable loop mode with multiple images', () => {
    vi.mocked(useUseImageGenerationStore).mockReturnValue({
      items: [
        { path: 'images/a.png', file_name: 'a.png' },
        { path: 'images/b.png', file_name: 'b.png' }
      ]
    } as never)

    render(<GeneratorPhotoviewCarousel initialIndex={0} />)

    expect(screen.getByTestId('swiper')).toHaveAttribute('data-loop', 'true')
  })

  it('should disable loop mode with single image', () => {
    vi.mocked(useUseImageGenerationStore).mockReturnValue({
      items: [{ path: 'images/a.png', file_name: 'a.png' }]
    } as never)

    render(<GeneratorPhotoviewCarousel initialIndex={0} />)

    expect(screen.getByTestId('swiper')).toHaveAttribute('data-loop', 'false')
  })

  it('should clamp initial index', () => {
    vi.mocked(useUseImageGenerationStore).mockReturnValue({
      items: [
        { path: 'images/a.png', file_name: 'a.png' },
        { path: 'images/b.png', file_name: 'b.png' }
      ]
    } as never)

    render(<GeneratorPhotoviewCarousel initialIndex={999} />)

    expect(screen.getByTestId('swiper')).toHaveAttribute(
      'data-initial-slide',
      '1'
    )
  })
})
