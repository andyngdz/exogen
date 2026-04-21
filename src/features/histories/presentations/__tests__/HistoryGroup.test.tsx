import { HistoryItem } from '@/types'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HistoryGroup } from '../HistoryGroup'

// Mock dependencies
vi.mock('react-vertical-timeline-component', () => ({
  VerticalTimeline: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="vertical-timeline">{children}</div>
  ),
  VerticalTimelineElement: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="timeline-element">{children}</div>
  )
}))

vi.mock('../HistoryItemContainer', () => ({
  HistoryItemContainer: ({ history }: { history: HistoryItem }) => (
    <div data-testid="history-item-container" data-history-id={history.id}>
      Mock History Item
    </div>
  )
}))

vi.mock('lucide-react', () => ({
  Clock: () => <div data-testid="clock-icon" />
}))

describe('HistoryGroup', () => {
  it('should render history items in timeline', () => {
    const mockHistories: HistoryItem[] = [
      {
        id: 1,
        created_at: '2023-01-01T10:00:00Z',
        updated_at: '2023-01-01T10:00:00Z',
        prompt: 'Test prompt 1',
        model: 'test-model',
        config: {
          width: 512,
          height: 512,

          loras: [],
          number_of_images: 1,
          prompt: 'Test prompt 1',
          negative_prompt: '',
          cfg_scale: 7,
          clip_skip: 2,
          steps: 20,
          seed: -1,
          sampler: 'Euler a',
          styles: []
        },
        generated_images: []
      },
      {
        id: 2,
        created_at: '2023-01-01T11:00:00Z',
        updated_at: '2023-01-01T11:00:00Z',
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

    render(<HistoryGroup histories={mockHistories} />)

    const historyItems = screen.getAllByTestId('history-item-container')
    expect(historyItems).toHaveLength(2)
    expect(historyItems[0]).toHaveAttribute('data-history-id', '1')
    expect(historyItems[1]).toHaveAttribute('data-history-id', '2')
  })
})
