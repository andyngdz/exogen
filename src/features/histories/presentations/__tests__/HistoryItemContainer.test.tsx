import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { dateFormatter } from '@/services'
import { HistoryItem } from '@/types'
import { HistoryItemContainer } from '../HistoryItemContainer'
import { useHistoryPhotoviewStore } from '../../states/useHistoryPhotoviewStore'

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <div data-testid="next-image" data-src={src} data-alt={alt} />
  )
}))

vi.mock('@/services', () => ({
  dateFormatter: {
    time: vi.fn().mockReturnValue('10:00 AM')
  }
}))

vi.mock('../HistoryUseConfigButton', () => ({
  HistoryUseConfigButton: ({ history }: { history: HistoryItem }) => (
    <button data-testid="use-config-button" data-history-id={history.id}>
      Use Config
    </button>
  )
}))

vi.mock('../../states/useHistoryPhotoviewStore')

describe('HistoryItemContainer', () => {
  const mockOpenPhotoview = vi.fn()

  beforeEach(() => {
    vi.mocked(dateFormatter.time).mockReturnValue('10:00 AM')
    vi.mocked(useHistoryPhotoviewStore).mockReturnValue({
      isOpen: false,
      currentHistoryId: null,
      openPhotoview: mockOpenPhotoview,
      closePhotoview: vi.fn()
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render history details', () => {
    const mockHistory: HistoryItem = {
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

    render(<HistoryItemContainer history={mockHistory} />)

    expect(dateFormatter.time).toHaveBeenCalledWith('2023-01-01T10:00:00ZZ')
    expect(screen.getByText('10:00 AM')).toBeInTheDocument()
    expect(screen.getByText('test-model')).toBeInTheDocument()
    expect(screen.getByText('Test prompt')).toBeInTheDocument()
    expect(screen.getByTestId('use-config-button')).toBeInTheDocument()
  })

  it('should render generated images when available', () => {
    const mockHistory: HistoryItem = {
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
      generated_images: [
        {
          id: 101,
          path: 'static/images/image1.png',
          is_nsfw: false,
          file_name: 'image1.png',
          created_at: '2023-01-01T10:00:00Z',
          updated_at: '2023-01-01T10:00:00Z',
          history_id: 1
        },
        {
          id: 102,
          path: 'static/images/image2.png',
          is_nsfw: false,
          file_name: 'image2.png',
          created_at: '2023-01-01T10:00:00Z',
          updated_at: '2023-01-01T10:00:00Z',
          history_id: 1
        }
      ]
    }

    render(<HistoryItemContainer history={mockHistory} />)

    const images = screen.getAllByTestId('next-image')
    expect(images).toHaveLength(2)
    expect(images[0]).toHaveAttribute(
      'data-src',
      'http://localhost:8000/static/images/image1.png'
    )
    expect(images[0]).toHaveAttribute('data-alt', 'Generated image 1')
    expect(images[1]).toHaveAttribute(
      'data-src',
      'http://localhost:8000/static/images/image2.png'
    )
    expect(images[1]).toHaveAttribute('data-alt', 'Generated image 2')
  })

  it('should not render images section when no images are available', () => {
    const mockHistory: HistoryItem = {
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

    render(<HistoryItemContainer history={mockHistory} />)

    expect(screen.queryByTestId('next-image')).not.toBeInTheDocument()
  })

  it('should call openPhotoview when card is clicked', async () => {
    const user = userEvent.setup()
    const mockHistory: HistoryItem = {
      id: 123,
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

    render(<HistoryItemContainer history={mockHistory} />)

    const card = screen.getByRole('button', {
      name: /view details for test-model generated at 10:00 AM/i
    })
    await user.click(card)

    expect(mockOpenPhotoview).toHaveBeenCalledWith(123)
  })

  it('should have accessible label with model and time', () => {
    const mockHistory: HistoryItem = {
      id: 1,
      created_at: '2023-01-01T10:00:00Z',
      updated_at: '2023-01-01T10:00:00Z',
      prompt: 'Test prompt',
      model: 'stable-diffusion-v1',
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

    render(<HistoryItemContainer history={mockHistory} />)

    expect(
      screen.getByRole('button', {
        name: /view details for stable-diffusion-v1 generated at 10:00 AM/i
      })
    ).toBeInTheDocument()
  })

  it('should render CardHeader, CardBody, and conditionally CardFooter', () => {
    const mockHistory: HistoryItem = {
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
      generated_images: [
        {
          id: 101,
          path: 'static/images/image1.png',
          is_nsfw: false,
          file_name: 'image1.png',
          created_at: '2023-01-01T10:00:00Z',
          updated_at: '2023-01-01T10:00:00Z',
          history_id: 1
        }
      ]
    }

    render(<HistoryItemContainer history={mockHistory} />)

    expect(screen.getByText('10:00 AM')).toBeInTheDocument()
    expect(screen.getByText('test-model')).toBeInTheDocument()
    expect(screen.getByText('Test prompt')).toBeInTheDocument()
    expect(screen.getByTestId('use-config-button')).toBeInTheDocument()
    expect(screen.getByTestId('next-image')).toBeInTheDocument()
  })
})
