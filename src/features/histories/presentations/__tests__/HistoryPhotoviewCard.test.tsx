import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { dateFormatter } from '@/services'
import { HistoryItem } from '@/types'
import { UpscaleFactor, UpscalerType } from '@/cores/constants'
import { HistoryPhotoviewCard } from '../HistoryPhotoviewCard'

vi.mock('@/services', () => ({
  dateFormatter: {
    datetime: vi.fn().mockReturnValue('Jan 15, 2024 at 10:30')
  }
}))

vi.mock('../HistoryPhotoviewConfigRow', () => ({
  HistoryPhotoviewConfigRow: ({
    label,
    value
  }: {
    label: string
    value: string | number | string[]
  }) => (
    <div data-testid="config-row" data-label={label} data-value={String(value)}>
      {label} {String(value)}
    </div>
  )
}))

vi.mock('../HistoryPhotoviewImageGrid', () => ({
  HistoryPhotoviewImageGrid: ({ images }: { images: unknown[] }) =>
    images.length > 0 ? (
      <div data-testid="image-grid" data-count={images.length}>
        {images.map((_, index) => (
          <div key={index} data-testid="next-image" />
        ))}
      </div>
    ) : null
}))

vi.mock('../HistoryUseConfigButton', () => ({
  HistoryUseConfigButton: () => (
    <button data-testid="use-config-button">Use Config</button>
  )
}))

vi.mock('../HistoryDeleteButton', () => ({
  HistoryDeleteButton: () => <button data-testid="delete-button">Delete</button>
}))

describe('HistoryPhotoviewCard', () => {
  const mockHistory: HistoryItem = {
    id: 1,
    created_at: '2024-01-15T10:30:00',
    updated_at: '2024-01-15T10:30:00',
    prompt: 'A beautiful landscape',
    model: 'stable-diffusion-v1-5',
    config: {
      width: 512,
      height: 768,
      steps: 25,
      cfg_scale: 7.5,
      clip_skip: 2,
      sampler: 'Euler a',
      seed: 12345,
      number_of_images: 4,
      hires_fix: {
        upscale_factor: UpscaleFactor.TWO,
        upscaler: UpscalerType.LANCZOS,
        denoising_strength: 0.7,
        steps: 20
      },
      loras: [],
      prompt: 'A beautiful landscape',
      negative_prompt: 'blurry, low quality',
      styles: ['anime', 'fantasy']
    },
    generated_images: [
      {
        id: 101,
        path: 'static/images/image1.png',
        is_nsfw: false,
        file_name: 'image1.png',
        created_at: '2024-01-15T10:30:00',
        updated_at: '2024-01-15T10:30:00',
        history_id: 1
      },
      {
        id: 102,
        path: 'static/images/image2.png',
        is_nsfw: false,
        file_name: 'image2.png',
        created_at: '2024-01-15T10:30:00',
        updated_at: '2024-01-15T10:30:00',
        history_id: 1
      }
    ]
  }

  it('should render header with formatted datetime and model', () => {
    render(<HistoryPhotoviewCard history={mockHistory} />)

    expect(dateFormatter.datetime).toHaveBeenCalledWith('2024-01-15T10:30:00Z')
    expect(screen.getByText('Jan 15, 2024 at 10:30')).toBeInTheDocument()
    expect(screen.getByText('stable-diffusion-v1-5')).toBeInTheDocument()
  })

  it('should render Use Config button in header', () => {
    render(<HistoryPhotoviewCard history={mockHistory} />)

    expect(screen.getByTestId('use-config-button')).toBeInTheDocument()
  })

  it('should render Delete button in header', () => {
    render(<HistoryPhotoviewCard history={mockHistory} />)

    expect(screen.getByTestId('delete-button')).toBeInTheDocument()
  })

  it('should render generated images grid', () => {
    render(<HistoryPhotoviewCard history={mockHistory} />)

    const imageGrid = screen.getByTestId('image-grid')
    expect(imageGrid).toBeInTheDocument()
    expect(imageGrid).toHaveAttribute('data-count', '2')
  })

  it('should not render images grid when no images', () => {
    const historyWithoutImages: HistoryItem = {
      ...mockHistory,
      generated_images: []
    }

    render(<HistoryPhotoviewCard history={historyWithoutImages} />)

    expect(screen.queryByTestId('image-grid')).not.toBeInTheDocument()
  })

  it('should render Configuration section header', () => {
    render(<HistoryPhotoviewCard history={mockHistory} />)

    expect(screen.getByText('Configuration')).toBeInTheDocument()
  })

  it('should render all config rows', () => {
    const { container } = render(<HistoryPhotoviewCard history={mockHistory} />)

    const configRows = screen.getAllByTestId('config-row')
    expect(configRows.length).toBeGreaterThan(10)

    expect(container.querySelector('[data-label="Prompt"]')).toBeInTheDocument()
    expect(container.querySelector('[data-label="Width"]')).toBeInTheDocument()
    expect(container.querySelector('[data-label="Height"]')).toBeInTheDocument()
    expect(container.querySelector('[data-label="Steps"]')).toBeInTheDocument()
    expect(
      container.querySelector('[data-label="CFG Scale"]')
    ).toBeInTheDocument()
    expect(
      container.querySelector('[data-label="Sampler"]')
    ).toBeInTheDocument()
    expect(container.querySelector('[data-label="Seed"]')).toBeInTheDocument()
    expect(
      container.querySelector('[data-label="Number of Images"]')
    ).toBeInTheDocument()
    expect(
      container.querySelector('[data-label="Hires Fix"]')
    ).toBeInTheDocument()
    expect(container.querySelector('[data-label="Styles"]')).toBeInTheDocument()
  })

  it('should display "Random" for seed value -1', () => {
    const historyWithRandomSeed: HistoryItem = {
      ...mockHistory,
      config: {
        ...mockHistory.config,
        seed: -1
      }
    }

    render(<HistoryPhotoviewCard history={historyWithRandomSeed} />)

    const seedRow = screen
      .getAllByTestId('config-row')
      .find((row) => row.getAttribute('data-label') === 'Seed')

    expect(seedRow).toHaveAttribute('data-value', 'Random')
  })

  it('should display "Yes" for hires_fix true', () => {
    render(<HistoryPhotoviewCard history={mockHistory} />)

    const hiresRow = screen
      .getAllByTestId('config-row')
      .find((row) => row.getAttribute('data-label') === 'Hires Fix')

    expect(hiresRow).toHaveAttribute('data-value', 'Yes')
  })

  it('should display "No" for hires_fix false', () => {
    const historyWithoutHiresFix: HistoryItem = {
      ...mockHistory,
      config: {
        ...mockHistory.config,
        hires_fix: undefined
      }
    }

    render(<HistoryPhotoviewCard history={historyWithoutHiresFix} />)

    const hiresRow = screen
      .getAllByTestId('config-row')
      .find((row) => row.getAttribute('data-label') === 'Hires Fix')

    expect(hiresRow).toHaveAttribute('data-value', 'No')
  })

  it('should display "None" for empty negative prompt', () => {
    const historyWithoutNegativePrompt: HistoryItem = {
      ...mockHistory,
      config: {
        ...mockHistory.config,
        negative_prompt: ''
      }
    }

    render(<HistoryPhotoviewCard history={historyWithoutNegativePrompt} />)

    const negativePromptRow = screen
      .getAllByTestId('config-row')
      .find((row) => row.getAttribute('data-label') === 'Negative Prompt')

    expect(negativePromptRow).toHaveAttribute('data-value', 'None')
  })

  it('should render multiple generated images in responsive grid', () => {
    const historyWithManyImages: HistoryItem = {
      ...mockHistory,
      generated_images: [
        ...mockHistory.generated_images,
        {
          id: 103,
          path: 'static/images/image3.png',
          is_nsfw: false,
          file_name: 'image3.png',
          created_at: '2024-01-15T10:30:00',
          updated_at: '2024-01-15T10:30:00',
          history_id: 1
        },
        {
          id: 104,
          path: 'static/images/image4.png',
          is_nsfw: false,
          file_name: 'image4.png',
          created_at: '2024-01-15T10:30:00',
          updated_at: '2024-01-15T10:30:00',
          history_id: 1
        }
      ]
    }

    render(<HistoryPhotoviewCard history={historyWithManyImages} />)

    const imageGrid = screen.getByTestId('image-grid')
    expect(imageGrid).toHaveAttribute('data-count', '4')
  })

  it('should render model in both header and config', () => {
    render(<HistoryPhotoviewCard history={mockHistory} />)

    expect(screen.getAllByText(/stable-diffusion-v1-5/)).toHaveLength(2)
  })
})
