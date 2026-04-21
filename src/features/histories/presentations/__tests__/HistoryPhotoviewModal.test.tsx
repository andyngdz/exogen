import { useHistoriesQuery } from '@/cores/api-queries'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useHistoryPhotoviewStore } from '../../states/useHistoryPhotoviewStore'
import { HistoryPhotoviewModal } from '../HistoryPhotoviewModal'

vi.mock('@/cores/api-queries')
vi.mock('../../states/useHistoryPhotoviewStore')
vi.mock('../../states/useDeleteHistory', () => ({
  useDeleteHistory: () => ({
    mutate: vi.fn(),
    isPending: false
  })
}))

const mockHistories = [
  {
    id: 1,
    model: 'test-model',
    created_at: '2024-01-01T10:00:00',
    prompt: 'test prompt',
    config: {
      width: 512,
      height: 512,
      steps: 20,
      cfg_scale: 7.5,
      clip_skip: 2,
      sampler: 'Euler a',
      seed: 12345,
      number_of_images: 1,

      loras: [],
      prompt: 'test prompt',
      negative_prompt: '',
      styles: []
    },
    generated_images: [],
    updated_at: '2024-01-01T10:00:00'
  }
]

describe('HistoryPhotoviewModal', () => {
  it('should not render when modal is closed', () => {
    vi.mocked(useHistoryPhotoviewStore).mockReturnValue({
      isOpen: false,
      currentHistoryId: null,
      openPhotoview: vi.fn(),
      closePhotoview: vi.fn()
    })
    vi.mocked(useHistoriesQuery).mockReturnValue({
      data: mockHistories,
      isLoading: false,
      error: null
    } as never)

    render(<HistoryPhotoviewModal />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should render when modal is open', () => {
    vi.mocked(useHistoryPhotoviewStore).mockReturnValue({
      isOpen: true,
      currentHistoryId: 1,
      openPhotoview: vi.fn(),
      closePhotoview: vi.fn()
    })
    vi.mocked(useHistoriesQuery).mockReturnValue({
      data: mockHistories,
      isLoading: false,
      error: null
    } as never)

    render(<HistoryPhotoviewModal />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
