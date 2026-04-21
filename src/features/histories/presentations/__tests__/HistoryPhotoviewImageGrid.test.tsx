import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HistoryGeneratedImage } from '@/types'
import { HistoryPhotoviewImageGrid } from '../HistoryPhotoviewImageGrid'

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <div data-testid="next-image" data-src={src} data-alt={alt} />
  )
}))

vi.mock('@/cores/backend-initialization', () => ({
  useBackendUrl: () => 'http://localhost:8000'
}))

describe('HistoryPhotoviewImageGrid', () => {
  const mockImages: HistoryGeneratedImage[] = [
    {
      id: 1,
      path: 'static/images/image1.png',
      is_nsfw: false,
      file_name: 'image1.png',
      created_at: '2024-01-15T10:30:00',
      updated_at: '2024-01-15T10:30:00',
      history_id: 1
    },
    {
      id: 2,
      path: 'static/images/image2.png',
      is_nsfw: false,
      file_name: 'image2.png',
      created_at: '2024-01-15T10:30:00',
      updated_at: '2024-01-15T10:30:00',
      history_id: 1
    }
  ]

  it('should render grid with images', () => {
    render(<HistoryPhotoviewImageGrid images={mockImages} />)

    const images = screen.getAllByTestId('next-image')
    expect(images).toHaveLength(2)
  })

  it('should render images with correct src', () => {
    render(<HistoryPhotoviewImageGrid images={mockImages} />)

    const images = screen.getAllByTestId('next-image')
    expect(images[0]).toHaveAttribute(
      'data-src',
      'http://localhost:8000/static/images/image1.png'
    )
    expect(images[1]).toHaveAttribute(
      'data-src',
      'http://localhost:8000/static/images/image2.png'
    )
  })

  it('should render images with correct alt text', () => {
    render(<HistoryPhotoviewImageGrid images={mockImages} />)

    const images = screen.getAllByTestId('next-image')
    expect(images[0]).toHaveAttribute('data-alt', 'Generated image 1')
    expect(images[1]).toHaveAttribute('data-alt', 'Generated image 2')
  })

  it('should render nothing when images array is empty', () => {
    const { container } = render(<HistoryPhotoviewImageGrid images={[]} />)

    expect(container.firstChild).toBeNull()
  })

  it('should apply responsive grid classes', () => {
    const { container } = render(
      <HistoryPhotoviewImageGrid images={mockImages} />
    )

    const grid = container.querySelector('.grid')
    expect(grid).toHaveClass('grid-cols-2')
    expect(grid).toHaveClass('md:grid-cols-3')
    expect(grid).toHaveClass('lg:grid-cols-4')
    expect(grid).toHaveClass('gap-4')
  })

  it('should render image containers with aspect-square', () => {
    const { container } = render(
      <HistoryPhotoviewImageGrid images={mockImages} />
    )

    const imageContainers = container.querySelectorAll('.aspect-square')
    expect(imageContainers).toHaveLength(2)
  })

  it('should use file_name and index as key', () => {
    const { container } = render(
      <HistoryPhotoviewImageGrid images={mockImages} />
    )

    const imageContainers = container.querySelectorAll('.relative')
    expect(imageContainers).toHaveLength(2)
  })

  it('should handle single image', () => {
    const singleImage = [mockImages[0]]
    render(<HistoryPhotoviewImageGrid images={singleImage} />)

    const images = screen.getAllByTestId('next-image')
    expect(images).toHaveLength(1)
  })

  it('should apply rounded-lg to image containers', () => {
    const { container } = render(
      <HistoryPhotoviewImageGrid images={mockImages} />
    )

    const imageContainers = container.querySelectorAll('.rounded-lg')
    expect(imageContainers).toHaveLength(2)
  })
})
