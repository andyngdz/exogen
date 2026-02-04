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

vi.mock('@heroui/react', async () => {
  const actual =
    await vi.importActual<typeof import('@heroui/react')>('@heroui/react')
  return {
    ...actual,
    Skeleton: ({ className }: { className?: string }) => (
      <div className={className} data-testid="skeleton" />
    )
  }
})

describe('GeneratorPhotoviewCarousel', () => {
  it('should render empty state when no items', () => {
    vi.mocked(useUseImageGenerationStore).mockReturnValue({
      items: [],
      imageStepEnds: []
    } as never)

    render(<GeneratorPhotoviewCarousel initialIndex={0} />)

    expect(screen.getByText('No images to display')).toBeInTheDocument()
  })

  it('should render swiper with all image slides', () => {
    vi.mocked(useUseImageGenerationStore).mockReturnValue({
      items: [
        { path: '', file_name: 'a.png' },
        { path: '', file_name: 'b.png' },
        { path: '', file_name: 'c.png' }
      ],
      imageStepEnds: [
        { index: 0, current_step: 0, timestep: 0, image_base64: 'a' },
        { index: 1, current_step: 0, timestep: 0, image_base64: 'b' },
        { index: 2, current_step: 0, timestep: 0, image_base64: 'c' }
      ]
    } as never)

    render(<GeneratorPhotoviewCarousel initialIndex={0} />)

    expect(screen.getAllByTestId('swiper-slide')).toHaveLength(3)
  })

  it('should enable loop mode with multiple images', () => {
    vi.mocked(useUseImageGenerationStore).mockReturnValue({
      items: [
        { path: '', file_name: 'a.png' },
        { path: '', file_name: 'b.png' }
      ],
      imageStepEnds: [
        { index: 0, current_step: 0, timestep: 0, image_base64: 'a' },
        { index: 1, current_step: 0, timestep: 0, image_base64: 'b' }
      ]
    } as never)

    render(<GeneratorPhotoviewCarousel initialIndex={0} />)

    expect(screen.getByTestId('swiper')).toHaveAttribute('data-loop', 'true')
  })

  it('should disable loop mode with single image', () => {
    vi.mocked(useUseImageGenerationStore).mockReturnValue({
      items: [{ path: '', file_name: 'a.png' }],
      imageStepEnds: [
        { index: 0, current_step: 0, timestep: 0, image_base64: 'a' }
      ]
    } as never)

    render(<GeneratorPhotoviewCarousel initialIndex={0} />)

    expect(screen.getByTestId('swiper')).toHaveAttribute('data-loop', 'false')
  })

  it('should clamp initial index', () => {
    vi.mocked(useUseImageGenerationStore).mockReturnValue({
      items: [
        { path: '', file_name: 'a.png' },
        { path: '', file_name: 'b.png' }
      ],
      imageStepEnds: [
        { index: 0, current_step: 0, timestep: 0, image_base64: 'a' },
        { index: 1, current_step: 0, timestep: 0, image_base64: 'b' }
      ]
    } as never)

    render(<GeneratorPhotoviewCarousel initialIndex={999} />)

    expect(screen.getByTestId('swiper')).toHaveAttribute(
      'data-initial-slide',
      '1'
    )
  })
})
