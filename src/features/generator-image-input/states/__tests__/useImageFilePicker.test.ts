import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { createFileListLike } from '@/cores/test-utils'
import { useImageFilePicker } from '../useImageFilePicker'

describe('useImageFilePicker', () => {
  it('calls onFile with the first file when files are selected', async () => {
    const onFile = vi
      .fn<(file: File) => Promise<void>>()
      .mockResolvedValue(undefined)
    const { result } = renderHook(() => useImageFilePicker({ onFile }))

    const file = new File(['content'], 'test.png', { type: 'image/png' })
    const fileList = createFileListLike([file])

    const input = document.createElement('input')
    Object.defineProperty(input, 'files', {
      value: fileList
    })
    input.value = 'C:\\fakepath\\test.png'

    const event = { target: input }

    await act(async () => {
      await result.current.onFileChange(event)
    })

    expect(onFile).toHaveBeenCalledWith(file)
    expect(event.target.value).toBe('')
  })

  it('does nothing when event.target.files is null', async () => {
    const onFile = vi
      .fn<(file: File) => Promise<void>>()
      .mockResolvedValue(undefined)
    const { result } = renderHook(() => useImageFilePicker({ onFile }))

    const input = document.createElement('input')
    Object.defineProperty(input, 'files', {
      value: null
    })
    input.value = ''

    const event = { target: input }

    await act(async () => {
      await result.current.onFileChange(event)
    })

    expect(onFile).not.toHaveBeenCalled()
  })

  it('does nothing when files list is empty', async () => {
    const onFile = vi
      .fn<(file: File) => Promise<void>>()
      .mockResolvedValue(undefined)
    const { result } = renderHook(() => useImageFilePicker({ onFile }))

    const fileList = createFileListLike([])
    const input = document.createElement('input')
    Object.defineProperty(input, 'files', {
      value: fileList
    })
    input.value = ''

    const event = { target: input }

    await act(async () => {
      await result.current.onFileChange(event)
    })

    expect(onFile).not.toHaveBeenCalled()
  })

  it('resets input value after successful file selection to allow re-uploading same file', async () => {
    const onFile = vi
      .fn<(file: File) => Promise<void>>()
      .mockResolvedValue(undefined)
    const { result } = renderHook(() => useImageFilePicker({ onFile }))

    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    const fileList = createFileListLike([file])

    const input = document.createElement('input')
    Object.defineProperty(input, 'files', {
      value: fileList
    })
    input.value = 'C:\\fakepath\\test.jpg'

    const event = { target: input }

    await act(async () => {
      await result.current.onFileChange(event)
    })

    // Verify input value is reset
    expect(event.target.value).toBe('')
  })

  it('handles multiple files by picking only the first one', async () => {
    const onFile = vi
      .fn<(file: File) => Promise<void>>()
      .mockResolvedValue(undefined)
    const { result } = renderHook(() => useImageFilePicker({ onFile }))

    const file1 = new File(['content1'], 'first.png', { type: 'image/png' })
    const file2 = new File(['content2'], 'second.png', { type: 'image/png' })
    const fileList = createFileListLike([file1, file2])

    const input = document.createElement('input')
    Object.defineProperty(input, 'files', {
      value: fileList
    })
    input.value = 'C:\\fakepath\\first.png'

    const event = { target: input }

    await act(async () => {
      await result.current.onFileChange(event)
    })

    expect(onFile).toHaveBeenCalledWith(file1)
    expect(onFile).toHaveBeenCalledTimes(1)
  })
})
