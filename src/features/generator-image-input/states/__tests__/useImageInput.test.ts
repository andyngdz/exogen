import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { toast } from '@heroui/react'
import { imageInputService } from '../../services'
import { useImageInputController } from '../useImageInputController'

vi.mock('@heroui/react', () => ({
  toast: { success: vi.fn(), danger: vi.fn(), warning: vi.fn() }
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

    expect(vi.mocked(toast.danger)).toHaveBeenCalledWith(
      'Input image',
      expect.objectContaining({ description: 'Only image files are supported' })
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
    expect(vi.mocked(toast.success)).not.toHaveBeenCalled()
    expect(vi.mocked(toast.danger)).not.toHaveBeenCalled()
    expect(vi.mocked(toast.warning)).not.toHaveBeenCalled()
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
    expect(vi.mocked(toast.danger)).toHaveBeenCalledWith(
      'Input image',
      expect.objectContaining({ description: 'boom' })
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
    expect(vi.mocked(toast.danger)).toHaveBeenCalledWith(
      'Input image',
      expect.objectContaining({ description: 'Failed to read file' })
    )
  })
})
