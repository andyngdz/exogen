import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { useImageFilePicker } from '../useImageFilePicker'

describe('useImageFilePicker', () => {
  it('calls onFile with the first file when files are selected', () => {
    const onFile = vi.fn()
    const { result } = renderHook(() => useImageFilePicker({ onFile }))

    const file = new File(['content'], 'test.png', { type: 'image/png' })
    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => (index === 0 ? file : null)
    } as unknown as FileList

    const event = {
      target: {
        files: fileList,
        value: 'C:\\fakepath\\test.png'
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>

    act(() => {
      result.current.onFileChange(event)
    })

    expect(onFile).toHaveBeenCalledWith(file)
    expect(event.target.value).toBe('')
  })

  it('does nothing when event.target.files is null', () => {
    const onFile = vi.fn()
    const { result } = renderHook(() => useImageFilePicker({ onFile }))

    const event = {
      target: {
        files: null,
        value: ''
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>

    act(() => {
      result.current.onFileChange(event)
    })

    expect(onFile).not.toHaveBeenCalled()
  })

  it('does nothing when files list is empty', () => {
    const onFile = vi.fn()
    const { result } = renderHook(() => useImageFilePicker({ onFile }))

    const fileList = {
      length: 0,
      item: () => null
    } as unknown as FileList

    const event = {
      target: {
        files: fileList,
        value: ''
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>

    act(() => {
      result.current.onFileChange(event)
    })

    expect(onFile).not.toHaveBeenCalled()
  })

  it('resets input value after successful file selection to allow re-uploading same file', () => {
    const onFile = vi.fn()
    const { result } = renderHook(() => useImageFilePicker({ onFile }))

    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => (index === 0 ? file : null)
    } as unknown as FileList

    const event = {
      target: {
        files: fileList,
        value: 'C:\\fakepath\\test.jpg'
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>

    act(() => {
      result.current.onFileChange(event)
    })

    // Verify input value is reset
    expect(event.target.value).toBe('')
  })

  it('handles multiple files by picking only the first one', () => {
    const onFile = vi.fn()
    const { result } = renderHook(() => useImageFilePicker({ onFile }))

    const file1 = new File(['content1'], 'first.png', { type: 'image/png' })
    const file2 = new File(['content2'], 'second.png', { type: 'image/png' })
    const fileList = {
      0: file1,
      1: file2,
      length: 2,
      item: (index: number) => {
        if (index === 0) return file1
        if (index === 1) return file2
        return null
      }
    } as unknown as FileList

    const event = {
      target: {
        files: fileList,
        value: 'C:\\fakepath\\first.png'
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>

    act(() => {
      result.current.onFileChange(event)
    })

    expect(onFile).toHaveBeenCalledWith(file1)
    expect(onFile).toHaveBeenCalledTimes(1)
  })
})
