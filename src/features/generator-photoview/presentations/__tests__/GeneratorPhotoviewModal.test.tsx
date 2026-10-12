import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useDownloadImages } from '@/features/generator-previewers/states'
import { useUseImageGenerationStore } from '@/features/generators'
import { createStoreSelectorMock } from '@/cores/test-utils'
import { useGeneratorPhotoviewStore } from '../../states/useGeneratorPhotoviewStore'
import { GeneratorPhotoviewModal } from '../GeneratorPhotoviewModal'

vi.mock('@/features/generator-previewers/states', () => ({
  useDownloadImages: vi.fn()
}))

const { loadAsInput } = vi.hoisted(() => ({ loadAsInput: vi.fn() }))

vi.mock('@/features/generators', () => ({
  useUseImageGenerationStore: vi.fn(),
  useImageAsInput: () => ({ isUsingAsInput: false, loadAsInput }),
  useLastRunStore: vi.fn((selector: (state: object) => unknown) =>
    selector({ prompt: 'a lighthouse at dusk', seed: -1 })
  )
}))

vi.mock('../GeneratorPhotoviewCarousel', () => ({
  GeneratorPhotoviewCarousel: () => <div data-testid="carousel" />
}))

vi.mock('lucide-react', () => ({
  Download: () => <span data-testid="download-icon" />,
  ImageUp: () => <span data-testid="use-icon" />
}))

const mockStores = () => {
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

  it('downloads the image and uses it as input, then closes', async () => {
    const onDownloadImage = vi.fn()
    vi.mocked(useDownloadImages).mockReturnValue({ onDownloadImage })
    loadAsInput.mockResolvedValue(true)
    mockStores()
    useGeneratorPhotoviewStore.setState({ isOpen: true, currentIndex: 0 })

    render(<GeneratorPhotoviewModal />)

    fireEvent.click(screen.getByRole('button', { name: /download/i }))
    expect(onDownloadImage).toHaveBeenCalledWith(
      'http://localhost:8000/images/out.png'
    )

    fireEvent.click(screen.getByRole('button', { name: /use as input/i }))

    await waitFor(() => {
      expect(loadAsInput).toHaveBeenCalledWith(
        'http://localhost:8000/images/out.png'
      )
      expect(useGeneratorPhotoviewStore.getState().isOpen).toBe(false)
    })
  })

  it('stays open when the image cannot be used as input', async () => {
    vi.mocked(useDownloadImages).mockReturnValue({ onDownloadImage: vi.fn() })
    loadAsInput.mockResolvedValue(false)
    mockStores()
    useGeneratorPhotoviewStore.setState({ isOpen: true, currentIndex: 0 })

    render(<GeneratorPhotoviewModal />)

    fireEvent.click(screen.getByRole('button', { name: /use as input/i }))

    await waitFor(() => {
      expect(loadAsInput).toHaveBeenCalled()
    })
    expect(useGeneratorPhotoviewStore.getState().isOpen).toBe(true)
  })
})
