import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useHistories } from '../../states'
import { HistoryGroup as HistoryGroupType } from '../../states/useHistoryGroups'
import { Histories } from '../Histories'
import { HistoryGroup } from '../HistoryGroup'

// Mock next/image to avoid width/height requirement in tests
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    return <img {...props} alt="Test image" />
  }
}))

// Mock dependencies
vi.mock('@heroui/react', async () => {
  const actual =
    await vi.importActual<typeof import('@heroui/react')>('@heroui/react')
  return {
    ...actual,
    Accordion: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="accordion">{children}</div>
    ),
    AccordionItem: ({
      children,
      title
    }: {
      children: React.ReactNode
      title: string
    }) => (
      <div data-testid="accordion-item" data-title={title}>
        {children}
      </div>
    )
  }
})

vi.mock('../../states', () => ({
  useHistories: vi.fn()
}))

vi.mock('../HistoryGroup', () => ({
  HistoryGroup: vi.fn(() => <div data-testid="history-group" />)
}))

vi.mock('../HistoryLoader', () => ({
  HistoryLoader: () => <div data-testid="history-loader" />
}))

describe('Histories', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading state', () => {
    vi.mocked(useHistories).mockReturnValue({
      historyGroups: [],
      isLoading: true,
      error: null
    })

    render(<Histories />)

    expect(screen.getByTestId('history-loader')).toBeInTheDocument()
  })

  it('should render error state', () => {
    vi.mocked(useHistories).mockReturnValue({
      historyGroups: [],
      isLoading: false,
      error: new Error('Failed to load')
    })

    render(<Histories />)

    expect(screen.getByText('Error loading history')).toBeInTheDocument()
  })

  it('should render empty state', () => {
    vi.mocked(useHistories).mockReturnValue({
      historyGroups: [],
      isLoading: false,
      error: null
    })

    render(<Histories />)

    expect(screen.getByText('No histories found')).toBeInTheDocument()
  })

  it('should render history groups', () => {
    const mockHistoryGroups: HistoryGroupType[] = [
      {
        date: '2023-01-01',
        histories: [
          {
            id: 1,
            created_at: '2023-01-01T10:00:00Z',
            updated_at: '2023-01-01T10:00:00Z',
            prompt: 'Test prompt',
            model: 'test-model',
            config: {
              width: 512,
              height: 512,

              loras: [],
              number_of_images: 1,
              prompt: 'Test prompt',
              negative_prompt: '',
              cfg_scale: 7,
              clip_skip: 2,
              steps: 20,
              seed: -1,
              sampler: 'Euler a',
              styles: []
            },
            generated_images: []
          }
        ]
      },
      {
        date: '2023-01-02',
        histories: [
          {
            id: 2,
            created_at: '2023-01-02T10:00:00Z',
            updated_at: '2023-01-02T10:00:00Z',
            prompt: 'Test prompt 2',
            model: 'test-model',
            config: {
              width: 512,
              height: 512,

              loras: [],
              number_of_images: 1,
              prompt: 'Test prompt 2',
              negative_prompt: '',
              cfg_scale: 7,
              clip_skip: 2,
              steps: 20,
              seed: -1,
              sampler: 'Euler a',
              styles: []
            },
            generated_images: []
          }
        ]
      }
    ]

    vi.mocked(useHistories).mockReturnValue({
      historyGroups: mockHistoryGroups,
      isLoading: false,
      error: null
    })

    render(<Histories />)

    const accordionItems = screen.getAllByTestId('accordion-item')
    expect(accordionItems).toHaveLength(2)
    expect(accordionItems[0]).toHaveAttribute('data-title', '2023-01-01')
    expect(accordionItems[1]).toHaveAttribute('data-title', '2023-01-02')
    expect(vi.mocked(HistoryGroup)).toHaveBeenCalledTimes(2)
  })
})
