import { mockNextImage } from '@/cores/test-utils'
import { useGeneratorPhotoviewStore } from '@/features/generator-photoview'
import { render, fireEvent } from '@testing-library/react'
import { useFormContext } from 'react-hook-form'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDownloadImages, useGeneratorPreviewer } from '../../states'
import {
  GeneratorPreviewerItem,
  GeneratorPreviewerItemProps
} from '../GeneratorPreviewerItem'

vi.mock('react-hook-form', () => ({
  useFormContext: vi.fn()
}))

vi.mock('@/features/generator-previewers/states', () => ({
  useGeneratorPreviewer: vi.fn(),
  useDownloadImages: vi.fn()
}))

vi.mock('@/features/generator-photoview', () => ({
  useGeneratorPhotoviewStore: vi.fn()
}))

vi.mock('next/image', () => mockNextImage())

// Mock HeroUI components
vi.mock('@heroui/react', async () => {
  const actual =
    await vi.importActual<typeof import('@heroui/react')>('@heroui/react')
  return {
    ...actual,
    Button: ({
      children,
      onPress,
      isIconOnly: _isIconOnly,
      ...props
    }: {
      children: React.ReactNode
      onPress?: () => void
      isIconOnly?: boolean
      [key: string]: unknown
    }) => (
      <button onClick={onPress} {...props}>
        {children}
      </button>
    ),
    Skeleton: ({ className }: { className?: string }) => (
      <div className={className} data-testid="skeleton" />
    )
  }
})

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Download: () => <div data-testid="download-icon" />
}))

describe('GeneratorPreviewerItem', () => {
  const mockWatch = vi.fn()
  const mockOnDownloadImage = vi.fn()
  const mockOpenPhotoview = vi.fn()
  const mockUseGeneratorPreviewer = vi.mocked(useGeneratorPreviewer)
  const mockUseDownloadImages = vi.mocked(useDownloadImages)
  const mockUseGeneratorPhotoviewStore = vi.mocked(useGeneratorPhotoviewStore)

  beforeEach(() => {
    // @ts-expect-error - We're only mocking the watch method that the component uses
    vi.mocked(useFormContext).mockReturnValue({ watch: mockWatch })
    mockWatch.mockImplementation((field: string) => {
      if (field === 'width') return 512
      if (field === 'height') return 512
      return 0
    })

    mockUseDownloadImages.mockReturnValue({
      onDownloadImage: mockOnDownloadImage
    })

    mockUseGeneratorPhotoviewStore.mockReturnValue({
      openPhotoview: mockOpenPhotoview
    } as never)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const defaultProps: GeneratorPreviewerItemProps = {
    imageStepEnd: {
      index: 0,
      current_step: 0,
      timestep: 0,
      image_base64: ''
    }
  }

  it('should render a skeleton when image is empty', () => {
    mockUseGeneratorPreviewer.mockReturnValue({
      items: [{ path: '', file_name: '' }],
      imageStepEnds: []
    })

    const { container } = render(<GeneratorPreviewerItem {...defaultProps} />)
    expect(container.querySelector('.rounded-2xl')).not.toBeNull()
  })

  it('should render NextImage with base64 when image is generated and path is not available', () => {
    mockUseGeneratorPreviewer.mockReturnValue({
      items: [{ path: '', file_name: '' }],
      imageStepEnds: []
    })

    const props: GeneratorPreviewerItemProps = {
      ...defaultProps,
      imageStepEnd: {
        ...defaultProps.imageStepEnd,
        image_base64: 'test-base64-string'
      }
    }

    const { getByTestId } = render(<GeneratorPreviewerItem {...props} />)
    const image = getByTestId('mock-next-image')
    expect(image.getAttribute('data-src')).toBe(
      'data:image/png;base64,test-base64-string'
    )
  })

  it('should render NextImage with http URL when image path is available', () => {
    mockUseGeneratorPreviewer.mockReturnValue({
      items: [{ path: 'images/test.png', file_name: 'test.png' }],
      imageStepEnds: []
    })

    const props: GeneratorPreviewerItemProps = {
      ...defaultProps,
      imageStepEnd: {
        ...defaultProps.imageStepEnd,
        image_base64: 'test-base64-string'
      }
    }

    const { getByTestId } = render(<GeneratorPreviewerItem {...props} />)
    const image = getByTestId('mock-next-image')
    expect(image.getAttribute('data-src')).toBe(
      'http://localhost:8000/images/test.png'
    )
  })

  it('should call onDownloadImage with correct URL when download button is clicked', () => {
    // Arrange: item has a valid path so the download button is rendered
    mockUseGeneratorPreviewer.mockReturnValue({
      items: [{ path: 'images/test.png', file_name: 'test.png' }],
      imageStepEnds: []
    })

    // Act: render and click the download button
    const { getByLabelText } = render(
      <GeneratorPreviewerItem {...defaultProps} />
    )
    const downloadButton = getByLabelText('Download image')
    fireEvent.click(downloadButton)

    // Assert: onDownloadImage is called with the composed HTTP URL
    expect(mockOnDownloadImage).toHaveBeenCalledTimes(1)
    expect(mockOnDownloadImage).toHaveBeenCalledWith(
      'http://localhost:8000/images/test.png'
    )

    // Should not open photoview from download button click
    expect(mockOpenPhotoview).not.toHaveBeenCalled()
  })

  it('should open photoview when tile is clicked', () => {
    mockUseGeneratorPreviewer.mockReturnValue({
      items: [{ path: 'images/test.png', file_name: 'test.png' }],
      imageStepEnds: []
    })

    const { getByRole } = render(<GeneratorPreviewerItem {...defaultProps} />)

    fireEvent.click(getByRole('button', { name: /open image 1 in photoview/i }))

    expect(mockOpenPhotoview).toHaveBeenCalledWith(0)
  })
})
