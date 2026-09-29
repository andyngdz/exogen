import { ModelRecommendationItem } from '@/types/api'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ModelRecommendationsCard } from '../ModelRecommendationsCard'

// Mock the child components
vi.mock('../ModelRecommendationMemoryBox', () => ({
  ModelRecommendationMemoryBox: ({
    icon,
    content
  }: {
    icon: React.ReactNode
    content: string
  }) => (
    <div data-testid="memory-box" data-content={content}>
      {icon}
    </div>
  )
}))

vi.mock('../ModelRecommendationsBadge', () => ({
  ModelRecommendationsBadge: () => (
    <div data-testid="recommendations-badge">Star</div>
  )
}))

vi.mock('../ModelRecommendationsTags', () => ({
  ModelRecommendationsTags: ({ tags }: { tags: string[] }) => (
    <div data-testid="tags">{tags.join(', ')}</div>
  )
}))

vi.mock('../ModelRecommendationsDownloadButton', () => ({
  ModelRecommendationsDownloadButton: ({ modelId }: { modelId: string }) => (
    <div data-testid="download-button" data-model-id={modelId}>
      Download Button
    </div>
  )
}))

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Gpu: ({ size }: { size: number }) => (
    <div data-testid="gpu-icon" data-size={size}>
      GPU
    </div>
  ),
  HardDrive: ({ size }: { size: number }) => (
    <div data-testid="harddrive-icon" data-size={size}>
      HardDrive
    </div>
  )
}))

describe('ModelRecommendationsCard', () => {
  const mockModel: ModelRecommendationItem = {
    id: 'model1',
    name: 'Test Model',
    description: 'A test model description',
    memory_requirement_gb: 8,
    model_size: '7B',
    tags: ['tag1', 'tag2'],
    is_recommended: true
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the model name and description', () => {
    render(<ModelRecommendationsCard model={mockModel} />)

    expect(screen.getByText('Test Model')).toBeInTheDocument()
    expect(screen.getByText('A test model description')).toBeInTheDocument()
  })

  it('displays recommendation badge when model is recommended', () => {
    render(<ModelRecommendationsCard model={mockModel} />)

    expect(screen.getByTestId('recommendations-badge')).toBeInTheDocument()
  })

  it("doesn't display recommendation badge when model is not recommended", () => {
    const nonRecommendedModel = {
      ...mockModel,
      is_recommended: false
    }

    render(<ModelRecommendationsCard model={nonRecommendedModel} />)

    expect(
      screen.queryByTestId('recommendations-badge')
    ).not.toBeInTheDocument()
  })

  it('displays memory boxes with correct content', () => {
    render(<ModelRecommendationsCard model={mockModel} />)

    const memoryBoxes = screen.getAllByTestId('memory-box')
    expect(memoryBoxes).toHaveLength(2)

    expect(memoryBoxes[0]).toHaveAttribute('data-content', '7B')
    expect(memoryBoxes[1]).toHaveAttribute('data-content', '8 GB')

    expect(screen.getByTestId('harddrive-icon')).toBeInTheDocument()
    expect(screen.getByTestId('gpu-icon')).toBeInTheDocument()
  })

  it('displays tags component with correct tags', () => {
    render(<ModelRecommendationsCard model={mockModel} />)

    const tagsElement = screen.getByTestId('tags')
    expect(tagsElement).toBeInTheDocument()
    expect(tagsElement).toHaveTextContent('tag1, tag2')
  })

  it('renders download button with correct model id', () => {
    render(<ModelRecommendationsCard model={mockModel} />)

    const downloadButton = screen.getByTestId('download-button')
    expect(downloadButton).toBeInTheDocument()
    expect(downloadButton).toHaveAttribute('data-model-id', 'model1')
  })

  it('renders card component', () => {
    const { container } = render(<ModelRecommendationsCard model={mockModel} />)

    const card = container.querySelector('[data-slot="card"]')
    expect(card).toBeInTheDocument()
  })
})
