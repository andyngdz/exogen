import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useDownloadImages } from '@/features/generator-previewers/states'
import {
  useGeneratorModeStore,
  useImage2ImageConfigStore,
  useUseImageGenerationStore
} from '@/features/generators'
import { dataUrlService } from '@/services/data-url'
import { GeneratorMode } from '@/types'
import { addToast } from '@heroui/react'
import { useGeneratorPhotoviewStore } from '../../states/useGeneratorPhotoviewStore'
import { GeneratorPhotoviewModal } from '../GeneratorPhotoviewModal'

vi.mock('@/features/generator-previewers/states', () => ({
  useDownloadImages: vi.fn()
}))

vi.mock('@/features/generators', () => ({
  useUseImageGenerationStore: vi.fn(),
  useImage2ImageConfigStore: vi.fn(),
  useGeneratorModeStore: vi.fn()
}))

vi.mock('@/services/data-url', () => ({
  dataUrlService: {
    fetchUrlToDataUrl: vi.fn()
  }
}))

vi.mock('../GeneratorPhotoviewCarousel', () => ({
  GeneratorPhotoviewCarousel: () => <div data-testid="carousel" />
}))

vi.mock('@heroui/react', async () => {
  const actual =
    await vi.importActual<typeof import('@heroui/react')>('@heroui/react')
  return {
    ...actual,
    Modal: ({
      children,
      isOpen
    }: {
      children: React.ReactNode
      isOpen?: boolean
    }) => (isOpen ? <div data-testid="modal">{children}</div> : null),
    ModalContent: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    ModalBody: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Button: ({
      children,
      onPress,
      isDisabled,
      isLoading,
      startContent: _startContent,
      ...props
    }: {
      children: React.ReactNode
      onPress?: () => void
      isDisabled?: boolean
      isLoading?: boolean
      startContent?: React.ReactNode
      [key: string]: unknown
    }) => (
      <button
        type="button"
        disabled={isDisabled || isLoading}
        onClick={onPress}
        {...props}
      >
        {children}
      </button>
    ),
    ButtonGroup: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    addToast: vi.fn()
  }
})

vi.mock('lucide-react', () => ({
  Download: () => <span data-testid="download-icon" />,
  ImageUp: () => <span data-testid="use-icon" />
}))

describe('GeneratorPhotoviewModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useGeneratorPhotoviewStore.setState({ isOpen: false, currentIndex: 0 })
  })

  it('should not render when closed', () => {
    vi.mocked(useUseImageGenerationStore).mockReturnValue({
      items: [{ path: 'images/out.png', file_name: 'out.png' }],
      imageStepEnds: [
        { index: 0, current_step: 0, timestep: 0, image_base64: 'abc' }
      ]
    } as never)
    vi.mocked(useImage2ImageConfigStore).mockReturnValue({
      setInitImageBase64: vi.fn()
    } as never)
    vi.mocked(useGeneratorModeStore).mockReturnValue({
      setMode: vi.fn()
    } as never)
    vi.mocked(useDownloadImages).mockReturnValue({
      onDownloadImage: vi.fn()
    })

    render(<GeneratorPhotoviewModal />)
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
  })

  it('should download and use image as input', async () => {
    const onDownloadImage = vi.fn()
    vi.mocked(useDownloadImages).mockReturnValue({ onDownloadImage })

    vi.mocked(dataUrlService.fetchUrlToDataUrl).mockResolvedValue(
      'data:image/png;base64,fromBlob'
    )

    const setInitImageBase64 = vi.fn()
    vi.mocked(useImage2ImageConfigStore).mockReturnValue({
      setInitImageBase64
    } as never)

    const setMode = vi.fn()
    vi.mocked(useGeneratorModeStore).mockReturnValue({ setMode } as never)

    vi.mocked(useUseImageGenerationStore).mockReturnValue({
      items: [{ path: 'images/out.png', file_name: 'out.png' }],
      imageStepEnds: [
        { index: 0, current_step: 0, timestep: 0, image_base64: 'abc' }
      ]
    } as never)

    useGeneratorPhotoviewStore.setState({
      isOpen: true,
      currentIndex: 0
    })

    render(<GeneratorPhotoviewModal />)

    fireEvent.click(screen.getByRole('button', { name: /download/i }))
    expect(onDownloadImage).toHaveBeenCalledWith(
      'http://localhost:8000/images/out.png'
    )

    fireEvent.click(
      screen.getByRole('button', { name: /use current image as input/i })
    )

    await waitFor(() => {
      expect(dataUrlService.fetchUrlToDataUrl).toHaveBeenCalledWith(
        'http://localhost:8000/images/out.png'
      )
      expect(setInitImageBase64).toHaveBeenCalledWith(
        'data:image/png;base64,fromBlob'
      )
      expect(setMode).toHaveBeenCalledWith(GeneratorMode.IMAGE_2_IMAGE)
      expect(useGeneratorPhotoviewStore.getState().isOpen).toBe(false)
    })
  })

  it('shows a toast when using image as input fails', async () => {
    const onDownloadImage = vi.fn()
    vi.mocked(useDownloadImages).mockReturnValue({ onDownloadImage })

    vi.mocked(dataUrlService.fetchUrlToDataUrl).mockRejectedValue(
      new Error('Failed to convert image')
    )

    const setInitImageBase64 = vi.fn()
    vi.mocked(useImage2ImageConfigStore).mockReturnValue({
      setInitImageBase64
    } as never)

    const setMode = vi.fn()
    vi.mocked(useGeneratorModeStore).mockReturnValue({ setMode } as never)

    vi.mocked(useUseImageGenerationStore).mockReturnValue({
      items: [{ path: 'images/out.png', file_name: 'out.png' }],
      imageStepEnds: [
        { index: 0, current_step: 0, timestep: 0, image_base64: 'abc' }
      ]
    } as never)

    useGeneratorPhotoviewStore.setState({
      isOpen: true,
      currentIndex: 0
    })

    render(<GeneratorPhotoviewModal />)

    fireEvent.click(
      screen.getByRole('button', { name: /use current image as input/i })
    )

    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith({
        title: 'Use as input',
        description: 'Failed to convert image',
        color: 'danger'
      })
      expect(setInitImageBase64).not.toHaveBeenCalled()
      expect(setMode).not.toHaveBeenCalled()
      expect(useGeneratorPhotoviewStore.getState().isOpen).toBe(true)
    })
  })

  it('uses fallback toast message for unknown errors', async () => {
    vi.mocked(useDownloadImages).mockReturnValue({ onDownloadImage: vi.fn() })
    vi.mocked(dataUrlService.fetchUrlToDataUrl).mockRejectedValue('failed')
    vi.mocked(useImage2ImageConfigStore).mockReturnValue({
      setInitImageBase64: vi.fn()
    } as never)
    vi.mocked(useGeneratorModeStore).mockReturnValue({
      setMode: vi.fn()
    } as never)
    vi.mocked(useUseImageGenerationStore).mockReturnValue({
      items: [{ path: 'images/out.png', file_name: 'out.png' }],
      imageStepEnds: [
        { index: 0, current_step: 0, timestep: 0, image_base64: 'abc' }
      ]
    } as never)

    useGeneratorPhotoviewStore.setState({ isOpen: true, currentIndex: 0 })

    render(<GeneratorPhotoviewModal />)

    fireEvent.click(
      screen.getByRole('button', { name: /use current image as input/i })
    )

    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith({
        title: 'Use as input',
        description: 'Failed to use image as input',
        color: 'danger'
      })
    })
  })
})
