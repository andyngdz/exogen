import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useHistoriesQuery } from '@/cores/api-queries'
import { HistoryItem } from '@/types'
import { HistoryPhotoviewCarousel } from '../HistoryPhotoviewCarousel'

vi.mock('@/cores/api-queries')

vi.mock('../HistoryPhotoviewCard', () => ({
  HistoryPhotoviewCard: ({ history }: { history: HistoryItem }) => (
    <div data-testid="history-card" data-history-id={history.id}>
      Card for {history.model}
    </div>
  )
}))

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

describe('HistoryPhotoviewCarousel', () => {
  const mockHistories: HistoryItem[] = [
    {
      id: 1,
      created_at: '2024-01-15T10:30:00',
      updated_at: '2024-01-15T10:30:00',
      prompt: 'Test prompt 1',
      model: 'model-1',
      config: {
        width: 512,
        height: 512,
        steps: 20,
        cfg_scale: 7,
        clip_skip: 2,
        sampler: 'Euler a',
        seed: 12345,
        number_of_images: 1,

        loras: [],
        prompt: 'Test prompt 1',
        negative_prompt: '',
        styles: []
      },
      generated_images: []
    },
    {
      id: 2,
      created_at: '2024-01-15T11:00:00',
      updated_at: '2024-01-15T11:00:00',
      prompt: 'Test prompt 2',
      model: 'model-2',
      config: {
        width: 512,
        height: 512,
        steps: 20,
        cfg_scale: 7,
        clip_skip: 2,
        sampler: 'Euler a',
        seed: 67890,
        number_of_images: 1,

        loras: [],
        prompt: 'Test prompt 2',
        negative_prompt: '',
        styles: []
      },
      generated_images: []
    },
    {
      id: 3,
      created_at: '2024-01-15T12:00:00',
      updated_at: '2024-01-15T12:00:00',
      prompt: 'Test prompt 3',
      model: 'model-3',
      config: {
        width: 512,
        height: 512,
        steps: 20,
        cfg_scale: 7,
        clip_skip: 2,
        sampler: 'Euler a',
        seed: 11111,
        number_of_images: 1,

        loras: [],
        prompt: 'Test prompt 3',
        negative_prompt: '',
        styles: []
      },
      generated_images: []
    }
  ]

  it('should render empty state when no histories', () => {
    vi.mocked(useHistoriesQuery).mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    } as never)

    render(<HistoryPhotoviewCarousel currentHistoryId={1} />)

    expect(screen.getByText('No history items to display')).toBeInTheDocument()
  })

  it('should render swiper with all history cards', () => {
    vi.mocked(useHistoriesQuery).mockReturnValue({
      data: mockHistories,
      isLoading: false,
      error: null
    } as never)

    render(<HistoryPhotoviewCarousel currentHistoryId={1} />)

    const cards = screen.getAllByTestId('history-card')
    expect(cards).toHaveLength(3)
    expect(cards[0]).toHaveAttribute('data-history-id', '1')
    expect(cards[1]).toHaveAttribute('data-history-id', '2')
    expect(cards[2]).toHaveAttribute('data-history-id', '3')
  })

  it('should enable loop mode with multiple histories', () => {
    vi.mocked(useHistoriesQuery).mockReturnValue({
      data: mockHistories,
      isLoading: false,
      error: null
    } as never)

    render(<HistoryPhotoviewCarousel currentHistoryId={1} />)

    const swiper = screen.getByTestId('swiper')
    expect(swiper).toHaveAttribute('data-loop', 'true')
  })

  it('should disable loop mode with single history', () => {
    vi.mocked(useHistoriesQuery).mockReturnValue({
      data: [mockHistories[0]],
      isLoading: false,
      error: null
    } as never)

    render(<HistoryPhotoviewCarousel currentHistoryId={1} />)

    const swiper = screen.getByTestId('swiper')
    expect(swiper).toHaveAttribute('data-loop', 'false')
  })

  it('should set initial slide based on currentHistoryId', () => {
    vi.mocked(useHistoriesQuery).mockReturnValue({
      data: mockHistories,
      isLoading: false,
      error: null
    } as never)

    render(<HistoryPhotoviewCarousel currentHistoryId={2} />)

    const swiper = screen.getByTestId('swiper')
    expect(swiper).toHaveAttribute('data-initial-slide', '1')
  })

  it('should default to first slide if currentHistoryId not found', () => {
    vi.mocked(useHistoriesQuery).mockReturnValue({
      data: mockHistories,
      isLoading: false,
      error: null
    } as never)

    render(<HistoryPhotoviewCarousel currentHistoryId={999} />)

    const swiper = screen.getByTestId('swiper')
    expect(swiper).toHaveAttribute('data-initial-slide', '0')
  })

  it('should render navigation buttons', () => {
    vi.mocked(useHistoriesQuery).mockReturnValue({
      data: mockHistories,
      isLoading: false,
      error: null
    } as never)

    render(<HistoryPhotoviewCarousel currentHistoryId={1} />)

    expect(
      screen.getByRole('button', { name: /previous history/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /next history/i })
    ).toBeInTheDocument()
  })

  it('should not render navigation buttons with single history', () => {
    vi.mocked(useHistoriesQuery).mockReturnValue({
      data: [mockHistories[0]],
      isLoading: false,
      error: null
    } as never)

    render(<HistoryPhotoviewCarousel currentHistoryId={1} />)

    expect(
      screen.queryByRole('button', { name: /previous history/i })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /next history/i })
    ).not.toBeInTheDocument()
  })

  it('should render correct number of swiper slides', () => {
    vi.mocked(useHistoriesQuery).mockReturnValue({
      data: mockHistories,
      isLoading: false,
      error: null
    } as never)

    render(<HistoryPhotoviewCarousel currentHistoryId={1} />)

    const slides = screen.getAllByTestId('swiper-slide')
    expect(slides).toHaveLength(3)
  })

  it('should handle empty data array', () => {
    vi.mocked(useHistoriesQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null
    } as never)

    render(<HistoryPhotoviewCarousel currentHistoryId={1} />)

    expect(screen.getByText('No history items to display')).toBeInTheDocument()
  })

  it('should calculate correct initial slide for last history', () => {
    vi.mocked(useHistoriesQuery).mockReturnValue({
      data: mockHistories,
      isLoading: false,
      error: null
    } as never)

    render(<HistoryPhotoviewCarousel currentHistoryId={3} />)

    const swiper = screen.getByTestId('swiper')
    expect(swiper).toHaveAttribute('data-initial-slide', '2')
  })
})
