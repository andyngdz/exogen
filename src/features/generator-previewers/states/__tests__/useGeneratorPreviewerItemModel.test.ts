import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { useBackendUrl } from '@/cores/backend-initialization'
import { useGeneratorAspectRatio } from '@/features/generator-configs'
import { useGeneratorPhotoviewStore } from '@/features/generator-photoview'
import { useUseImageGenerationStore } from '@/features/generators'
import { useGenerationStatusStore } from '@/features/generators/states'
import { ImageGenerationStepEndResponse } from '@/types'

import { useDownloadImages } from '../useDownloadImages'
import { useGeneratorPreviewerItemModel } from '../useGeneratorPreviewerItemModel'

vi.mock('@/cores/backend-initialization', () => ({
  useBackendUrl: vi.fn()
}))

vi.mock('@/features/generator-configs', () => ({
  useGeneratorAspectRatio: vi.fn()
}))

vi.mock('@/features/generator-photoview', () => ({
  useGeneratorPhotoviewStore: vi.fn()
}))

vi.mock('@/features/generators', () => ({
  useUseImageGenerationStore: vi.fn()
}))

vi.mock('@/features/generators/states', () => ({
  useGenerationStatusStore: vi.fn()
}))

vi.mock('../useDownloadImages', () => ({
  useDownloadImages: vi.fn()
}))

describe('useGeneratorPreviewerItemModel', () => {
  const onDownloadImage = vi.fn()
  const openPhotoview = vi.fn()

  const imageStepEnd: ImageGenerationStepEndResponse = {
    index: 1,
    current_step: 10,
    timestep: 0.5,
    image_base64: 'abc'
  }

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useBackendUrl).mockReturnValue('http://localhost:8000')
    vi.mocked(useGeneratorAspectRatio).mockReturnValue(1.5)
    vi.mocked(useGenerationStatusStore).mockReturnValue({
      isGenerating: false
    } as never)
    vi.mocked(useUseImageGenerationStore).mockReturnValue({
      items: [
        { path: 'images/0.png', file_name: '0.png' },
        { path: 'images/1.png', file_name: '1.png' }
      ]
    } as never)
    vi.mocked(useDownloadImages).mockReturnValue({ onDownloadImage })
    vi.mocked(useGeneratorPhotoviewStore).mockReturnValue({
      openPhotoview
    } as never)
  })

  it('returns enabled actions and calls handlers with expected values', () => {
    const { result } = renderHook(() =>
      useGeneratorPreviewerItemModel(imageStepEnd)
    )

    expect(result.current.aspectRatio).toBe(1.5)
    expect(result.current.imagePath).toBe('images/1.png')
    expect(result.current.canDownload).toBe(true)
    expect(result.current.canOpenPhotoview).toBe(true)
    expect(result.current.ariaLabel).toBe('Open image 2 in photoview')

    result.current.onOpenPhotoview()
    expect(openPhotoview).toHaveBeenCalledWith(1)

    result.current.onHandleDownloadImage()
    expect(onDownloadImage).toHaveBeenCalledWith(
      'http://localhost:8000/images/1.png'
    )
  })

  it('disables opening photoview while generating', () => {
    vi.mocked(useGenerationStatusStore).mockReturnValue({
      isGenerating: true
    } as never)

    const { result } = renderHook(() =>
      useGeneratorPreviewerItemModel(imageStepEnd)
    )

    expect(result.current.canDownload).toBe(true)
    expect(result.current.canOpenPhotoview).toBe(false)
  })

  it('disables actions when selected item path is empty', () => {
    vi.mocked(useUseImageGenerationStore).mockReturnValue({
      items: [
        { path: 'images/0.png', file_name: '0.png' },
        { path: '', file_name: '1.png' }
      ]
    } as never)

    const { result } = renderHook(() =>
      useGeneratorPreviewerItemModel(imageStepEnd)
    )

    expect(result.current.canDownload).toBe(false)
    expect(result.current.canOpenPhotoview).toBe(false)
  })
})
