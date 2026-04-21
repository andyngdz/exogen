import { useDownloadImages } from '@/features/generator-previewers/states/useDownloadImages'
import { addToast } from '@heroui/react'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'

// Partial mock to override only addToast while keeping other exports intact
vi.mock('@heroui/react', async () => {
  const actual =
    await vi.importActual<typeof import('@heroui/react')>('@heroui/react')
  return {
    ...actual,
    addToast: vi.fn()
  }
})

describe('useDownloadImages', () => {
  const testUrl = 'https://example.com/image.png'
  let mockDownloadImage: Mock<(url: string) => Promise<void>>

  beforeEach(() => {
    vi.clearAllMocks()
    mockDownloadImage = vi.fn().mockResolvedValue(undefined)
    window.electronAPI.downloadImage = mockDownloadImage
  })

  it('calls electronAPI.downloadImage with given URL', async () => {
    // Arrange
    const { onDownloadImage } = useDownloadImages()

    // Act
    await onDownloadImage(testUrl)

    // Assert
    expect(mockDownloadImage).toHaveBeenCalledTimes(1)
    expect(mockDownloadImage).toHaveBeenCalledWith(testUrl)
    expect(vi.mocked(addToast)).not.toHaveBeenCalled()
  })

  it('shows warning toast with error message when download fails with Error', async () => {
    // Arrange
    const expectedError = new Error('boom')
    mockDownloadImage.mockRejectedValueOnce(expectedError)
    const { onDownloadImage } = useDownloadImages()

    // Act
    await onDownloadImage(testUrl)

    // Assert
    expect(vi.mocked(addToast)).toHaveBeenCalledTimes(1)
    expect(vi.mocked(addToast)).toHaveBeenCalledWith({
      title: 'Failed to download image',
      description: 'boom',
      color: 'warning'
    })
  })

  it('shows warning toast with default message when download fails with non-Error', async () => {
    // Arrange
    mockDownloadImage.mockRejectedValueOnce('some-failure')
    const { onDownloadImage } = useDownloadImages()

    // Act
    await onDownloadImage(testUrl)

    // Assert
    expect(vi.mocked(addToast)).toHaveBeenCalledTimes(1)
    expect(vi.mocked(addToast)).toHaveBeenCalledWith({
      title: 'Failed to download image',
      description: 'Unknown error occurred',
      color: 'warning'
    })
  })
})
