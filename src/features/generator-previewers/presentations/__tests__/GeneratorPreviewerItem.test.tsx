import { mockNextImage } from '@/cores/test-utils'
import { render, fireEvent } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useGeneratorPreviewerItemModel } from '@/features/generator-previewers/states'
import {
  GeneratorPreviewerItem,
  GeneratorPreviewerItemProps
} from '../GeneratorPreviewerItem'

vi.mock('@/features/generator-previewers/states', () => ({
  useGeneratorPreviewerItemModel: vi.fn()
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
  const mockUseGeneratorPreviewerItemModel = vi.mocked(
    useGeneratorPreviewerItemModel
  )

  const mockOnHandleDownloadImage = vi.fn()
  const mockOnOpenPhotoview = vi.fn()

  beforeEach(() => {
    mockUseGeneratorPreviewerItemModel.mockReturnValue({
      aspectRatio: 1,
      baseURL: 'http://localhost:8000',
      imageIndex: 0,
      imagePath: 'images/test.png',
      imageBase64: '',
      canDownload: true,
      canOpenPhotoview: true,
      onOpenPhotoview: mockOnOpenPhotoview,
      onHandleDownloadImage: mockOnHandleDownloadImage,
      ariaLabel: 'Open image 1 in photoview'
    })
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

  it('should call onDownloadImage with correct URL when download button is clicked', () => {
    // Act: render and click the download button
    const { getByLabelText } = render(
      <GeneratorPreviewerItem {...defaultProps} />
    )
    const downloadButton = getByLabelText('Download image')
    fireEvent.click(downloadButton)

    expect(mockOnHandleDownloadImage).toHaveBeenCalledTimes(1)
    expect(mockOnOpenPhotoview).not.toHaveBeenCalled()
  })

  it('should open photoview when tile is clicked', () => {
    const { getByRole } = render(<GeneratorPreviewerItem {...defaultProps} />)

    fireEvent.click(getByRole('button', { name: /open image 1 in photoview/i }))

    expect(mockOnOpenPhotoview).toHaveBeenCalledTimes(1)
  })

  it('should not render tile as button when photoview is disabled', () => {
    mockUseGeneratorPreviewerItemModel.mockReturnValue({
      aspectRatio: 1,
      baseURL: 'http://localhost:8000',
      imageIndex: 0,
      imagePath: '',
      imageBase64: 'abc',
      canDownload: false,
      canOpenPhotoview: false,
      onOpenPhotoview: mockOnOpenPhotoview,
      onHandleDownloadImage: mockOnHandleDownloadImage,
      ariaLabel: 'Open image 1 in photoview'
    })

    const { queryByRole } = render(<GeneratorPreviewerItem {...defaultProps} />)

    expect(
      queryByRole('button', { name: /open image 1 in photoview/i })
    ).toBeNull()
  })
})
