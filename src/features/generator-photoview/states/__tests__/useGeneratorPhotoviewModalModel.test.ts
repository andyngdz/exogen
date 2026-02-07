import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useBackendUrl } from '@/cores/backend-initialization'
import { useDownloadImages } from '@/features/generator-previewers/states'
import {
  useGeneratorModeStore,
  useImage2ImageConfigStore,
  useUseImageGenerationStore
} from '@/features/generators'
import { dataUrlService } from '@/services/data-url'
import { useGeneratorPhotoviewStore } from '../useGeneratorPhotoviewStore'
import { useGeneratorPhotoviewModalModel } from '../useGeneratorPhotoviewModalModel'

vi.mock('@/cores/backend-initialization', () => ({
  useBackendUrl: vi.fn()
}))

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

vi.mock('../useGeneratorPhotoviewStore', () => ({
  useGeneratorPhotoviewStore: vi.fn()
}))

describe('useGeneratorPhotoviewModalModel', () => {
  const onDownloadImage = vi.fn()
  const setInitImageBase64 = vi.fn()
  const setMode = vi.fn()
  const closePhotoview = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useBackendUrl).mockReturnValue('http://localhost:8000')
    vi.mocked(useDownloadImages).mockReturnValue({ onDownloadImage })
    vi.mocked(useImage2ImageConfigStore).mockReturnValue({
      setInitImageBase64
    } as never)
    vi.mocked(useGeneratorModeStore).mockReturnValue({ setMode } as never)
    vi.mocked(useGeneratorPhotoviewStore).mockReturnValue({
      isOpen: true,
      currentIndex: 0,
      closePhotoview
    } as never)
  })

  it('disables actions and short-circuits handlers when image path is empty', async () => {
    vi.mocked(useUseImageGenerationStore).mockReturnValue({
      items: [{ path: '', file_name: 'out.png' }],
      imageStepEnds: []
    } as never)

    const { result } = renderHook(() => useGeneratorPhotoviewModalModel())

    expect(result.current.canDownload).toBe(false)
    expect(result.current.canUseAsInput).toBe(false)

    result.current.onDownload()
    expect(onDownloadImage).not.toHaveBeenCalled()

    await act(async () => {
      await result.current.onUseAsInput()
    })

    expect(dataUrlService.fetchUrlToDataUrl).not.toHaveBeenCalled()
    expect(setInitImageBase64).not.toHaveBeenCalled()
    expect(setMode).not.toHaveBeenCalled()
    expect(closePhotoview).not.toHaveBeenCalled()
  })

  it('handles empty items safely', async () => {
    vi.mocked(useUseImageGenerationStore).mockReturnValue({
      items: [],
      imageStepEnds: []
    } as never)

    const { result } = renderHook(() => useGeneratorPhotoviewModalModel())

    expect(result.current.safeIndex).toBe(0)
    expect(result.current.canDownload).toBe(false)
    expect(result.current.canUseAsInput).toBe(false)

    result.current.onDownload()

    await act(async () => {
      await result.current.onUseAsInput()
    })

    expect(onDownloadImage).not.toHaveBeenCalled()
    expect(dataUrlService.fetchUrlToDataUrl).not.toHaveBeenCalled()
  })
})
