import { renderHook } from '@testing-library/react'
import { act } from 'react'
import type { ChangeEvent } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { imageInputService } from '../../services'
import { useImageInput } from '../useImageInput'

vi.mock('../useImagePaste', () => ({
  useImagePaste: vi.fn()
}))

describe('useImageInput', () => {
  it('sets error when non-image file is selected', () => {
    const onImageDataUrl = vi.fn()
    const { result } = renderHook(() =>
      useImageInput({
        hasImage: false,
        onImageDataUrl
      })
    )

    vi.spyOn(imageInputService, 'isImageFile').mockReturnValue(false)

    const file = new File(['a'], 'a.txt', { type: 'text/plain' })
    const input = document.createElement('input')
    Object.defineProperty(input, 'files', {
      value: [file]
    })

    act(() => {
      result.current.onFileChange({
        target: input
      } as unknown as ChangeEvent<HTMLInputElement>)
    })

    expect(result.current.lastError).toBe('Only image files are supported')
    expect(onImageDataUrl).not.toHaveBeenCalled()
  })

  it('loads image file and calls onImageDataUrl', async () => {
    const onImageDataUrl = vi.fn()
    const { result } = renderHook(() =>
      useImageInput({
        hasImage: false,
        onImageDataUrl
      })
    )

    vi.spyOn(imageInputService, 'isImageFile').mockReturnValue(true)
    vi.spyOn(imageInputService, 'fileToDataUrl').mockResolvedValue(
      'data:image/png;base64,abc'
    )

    const file = new File(['a'], 'a.png', { type: 'image/png' })
    const input = document.createElement('input')
    Object.defineProperty(input, 'files', {
      value: [file]
    })

    await act(async () => {
      result.current.onFileChange({
        target: input
      } as unknown as ChangeEvent<HTMLInputElement>)
    })

    expect(onImageDataUrl).toHaveBeenCalledWith('data:image/png;base64,abc')
    expect(result.current.isLoading).toBe(false)
    expect(result.current.lastError).toBeUndefined()
  })

  it('surfaces file read errors and clears loading state', async () => {
    const onImageDataUrl = vi.fn()
    const { result } = renderHook(() =>
      useImageInput({
        hasImage: false,
        onImageDataUrl
      })
    )

    vi.spyOn(imageInputService, 'isImageFile').mockReturnValue(true)
    vi.spyOn(imageInputService, 'fileToDataUrl').mockRejectedValue(
      new Error('boom')
    )

    const file = new File(['a'], 'a.png', { type: 'image/png' })
    const input = document.createElement('input')
    Object.defineProperty(input, 'files', {
      value: [file]
    })

    await act(async () => {
      result.current.onFileChange({
        target: input
      } as unknown as ChangeEvent<HTMLInputElement>)
    })

    expect(onImageDataUrl).not.toHaveBeenCalled()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.lastError).toBe('boom')
  })
})
