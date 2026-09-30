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
import { createStoreSelectorMock } from '@/cores/test-utils'
import { toast } from '@heroui/react'
import { useGeneratorPhotoviewStore } from '../../states/useGeneratorPhotoviewStore'
import { GeneratorPhotoviewModal } from '../GeneratorPhotoviewModal'

vi.mock('@/features/generator-previewers/states', () => ({
  useDownloadImages: vi.fn()
}))

vi.mock('@/features/generators', () => ({
  useUseImageGenerationStore: vi.fn(),
  useImage2ImageConfigStore: vi.fn(),
  useGeneratorModeStore: vi.fn(),
  useLastRunStore: vi.fn((selector: (state: object) => unknown) =>
    selector({ prompt: 'a lighthouse at dusk', seed: -1 })
  )
}))

vi.mock('@/services/data-url', () => ({
  dataUrlService: {
    fetchUrlToDataUrl: vi.fn()
  }
}))

vi.mock('../GeneratorPhotoviewCarousel', () => ({
  GeneratorPhotoviewCarousel: () => <div data-testid="carousel" />
}))

vi.mock('@heroui/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@heroui/react')>()),
  toast: { success: vi.fn(), danger: vi.fn(), warning: vi.fn() }
}))

vi.mock('lucide-react', () => ({
  Download: () => <span data-testid="download-icon" />,
  ImageUp: () => <span data-testid="use-icon" />
}))

const mockStores = ({
  setInitImageBase64 = vi.fn(),
  setMode = vi.fn()
} = {}) => {
  vi.mocked(useImage2ImageConfigStore).mockImplementation(
    createStoreSelectorMock({ setInitImageBase64 })
  )
  vi.mocked(useGeneratorModeStore).mockImplementation(
    createStoreSelectorMock({ setMode })
  )
  vi.mocked(useUseImageGenerationStore).mockImplementation(
    createStoreSelectorMock({
      items: [{ path: 'images/out.png', file_name: 'out.png' }],
      imageStepEnds: [
        { index: 0, current_step: 0, timestep: 0, image_base64: 'abc' }
      ]
    })
  )
}

describe('GeneratorPhotoviewModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useGeneratorPhotoviewStore.setState({ isOpen: false, currentIndex: 0 })
  })

  it('should not render when closed', () => {
    vi.mocked(useDownloadImages).mockReturnValue({
      onDownloadImage: vi.fn()
    })

    mockStores()
    render(<GeneratorPhotoviewModal />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the submitted prompt and seed in the header', () => {
    vi.mocked(useDownloadImages).mockReturnValue({ onDownloadImage: vi.fn() })
    mockStores()
    useGeneratorPhotoviewStore.setState({ isOpen: true, currentIndex: 0 })

    render(<GeneratorPhotoviewModal />)

    expect(screen.getByText('Image 1 of 1')).toBeInTheDocument()
    expect(screen.getByText('a lighthouse at dusk')).toBeInTheDocument()
    expect(screen.getByText('Seed Random')).toBeInTheDocument()
  })

  it('should download and use image as input', async () => {
    const onDownloadImage = vi.fn()
    vi.mocked(useDownloadImages).mockReturnValue({ onDownloadImage })

    vi.mocked(dataUrlService.fetchUrlToDataUrl).mockResolvedValue(
      'data:image/png;base64,fromBlob'
    )

    const setInitImageBase64 = vi.fn()

    const setMode = vi.fn()
    mockStores({ setInitImageBase64, setMode })

    useGeneratorPhotoviewStore.setState({
      isOpen: true,
      currentIndex: 0
    })

    render(<GeneratorPhotoviewModal />)

    fireEvent.click(screen.getByRole('button', { name: /download/i }))
    expect(onDownloadImage).toHaveBeenCalledWith(
      'http://localhost:8000/images/out.png'
    )

    fireEvent.click(screen.getByRole('button', { name: /use as input/i }))

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

    const setMode = vi.fn()
    mockStores({ setInitImageBase64, setMode })

    useGeneratorPhotoviewStore.setState({
      isOpen: true,
      currentIndex: 0
    })

    render(<GeneratorPhotoviewModal />)

    fireEvent.click(screen.getByRole('button', { name: /use as input/i }))

    await waitFor(() => {
      expect(vi.mocked(toast.danger)).toHaveBeenCalledWith('Use as input', {
        description: 'Failed to convert image'
      })
      expect(setInitImageBase64).not.toHaveBeenCalled()
      expect(setMode).not.toHaveBeenCalled()
      expect(useGeneratorPhotoviewStore.getState().isOpen).toBe(true)
    })
  })

  it('uses fallback toast message for unknown errors', async () => {
    vi.mocked(useDownloadImages).mockReturnValue({ onDownloadImage: vi.fn() })
    vi.mocked(dataUrlService.fetchUrlToDataUrl).mockRejectedValue('failed')

    useGeneratorPhotoviewStore.setState({ isOpen: true, currentIndex: 0 })

    mockStores()
    render(<GeneratorPhotoviewModal />)

    fireEvent.click(screen.getByRole('button', { name: /use as input/i }))

    await waitFor(() => {
      expect(vi.mocked(toast.danger)).toHaveBeenCalledWith('Use as input', {
        description: 'Failed to use image as input'
      })
    })
  })
})
