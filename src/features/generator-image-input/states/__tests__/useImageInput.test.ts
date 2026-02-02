import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { addToast } from '@heroui/react'
import { imageInputService } from '../../services'
import { useImageInputController } from '../useImageInputController'

vi.mock('@heroui/react', () => ({
  addToast: vi.fn(() => 'toast-key')
}))

describe('useImageInputController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sets error when non-image file is selected', async () => {
    const onImageDataUrl = vi.fn()
    const { result } = renderHook(() =>
      useImageInputController({ onImageDataUrl })
    )

    vi.spyOn(imageInputService, 'isImageFile').mockReturnValue(false)

    const file = new File(['a'], 'a.txt', { type: 'text/plain' })

    await act(async () => {
      await result.current.onFile(file)
    })

    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Input image',
        description: 'Only image files are supported',
        color: 'danger'
      })
    )
    expect(onImageDataUrl).not.toHaveBeenCalled()
  })

  it('loads image file and calls onImageDataUrl', async () => {
    const onImageDataUrl = vi.fn()
    const { result } = renderHook(() =>
      useImageInputController({ onImageDataUrl })
    )

    vi.spyOn(imageInputService, 'isImageFile').mockReturnValue(true)
    vi.spyOn(imageInputService, 'fileToDataUrl').mockResolvedValue(
      'data:image/png;base64,abc'
    )

    const file = new File(['a'], 'a.png', { type: 'image/png' })

    await act(async () => {
      await result.current.onFile(file)
    })

    expect(onImageDataUrl).toHaveBeenCalledWith('data:image/png;base64,abc')
    expect(result.current.isLoading).toBe(false)
    expect(addToast).not.toHaveBeenCalled()
  })

  it('surfaces file read errors and clears loading state', async () => {
    const onImageDataUrl = vi.fn()
    const { result } = renderHook(() =>
      useImageInputController({ onImageDataUrl })
    )

    vi.spyOn(imageInputService, 'isImageFile').mockReturnValue(true)
    vi.spyOn(imageInputService, 'fileToDataUrl').mockRejectedValue(
      new Error('boom')
    )

    const file = new File(['a'], 'a.png', { type: 'image/png' })

    await act(async () => {
      await result.current.onFile(file)
    })

    expect(onImageDataUrl).not.toHaveBeenCalled()
    expect(result.current.isLoading).toBe(false)
    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Input image',
        description: 'boom',
        color: 'danger'
      })
    )
  })

  it('uses fallback message for non-Error rejections', async () => {
    const onImageDataUrl = vi.fn()
    const { result } = renderHook(() =>
      useImageInputController({ onImageDataUrl })
    )

    vi.spyOn(imageInputService, 'isImageFile').mockReturnValue(true)
    vi.spyOn(imageInputService, 'fileToDataUrl').mockRejectedValue('boom')

    const file = new File(['a'], 'a.png', { type: 'image/png' })

    await act(async () => {
      await result.current.onFile(file)
    })

    expect(onImageDataUrl).not.toHaveBeenCalled()
    expect(result.current.isLoading).toBe(false)
    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Input image',
        description: 'Failed to read file',
        color: 'danger'
      })
    )
  })
})
