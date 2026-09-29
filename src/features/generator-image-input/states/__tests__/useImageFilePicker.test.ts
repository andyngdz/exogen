import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { createFileListLike } from '@/cores/test-utils'
import { useImageFilePicker } from '../useImageFilePicker'

// jsdom cannot construct a real FileList, so the list-like stands in for it
const toFileList = (files: File[]) =>
  createFileListLike(files) as unknown as FileList

const renderPicker = () => {
  const onFile = vi
    .fn<(file: File) => Promise<void>>()
    .mockResolvedValue(undefined)
  const { result } = renderHook(() => useImageFilePicker({ onFile }))

  return { onFile, result }
}

describe('useImageFilePicker', () => {
  it('calls onFile with the first file when files are selected', async () => {
    const { onFile, result } = renderPicker()
    const file = new File(['content'], 'test.png', { type: 'image/png' })

    await act(async () => {
      await result.current.onFilesSelect(toFileList([file]))
    })

    expect(onFile).toHaveBeenCalledWith(file)
  })

  it('does nothing when no file list is given', async () => {
    const { onFile, result } = renderPicker()

    await act(async () => {
      await result.current.onFilesSelect(null)
    })

    expect(onFile).not.toHaveBeenCalled()
  })

  it('does nothing when files list is empty', async () => {
    const { onFile, result } = renderPicker()

    await act(async () => {
      await result.current.onFilesSelect(toFileList([]))
    })

    expect(onFile).not.toHaveBeenCalled()
  })

  it('handles multiple files by picking only the first one', async () => {
    const { onFile, result } = renderPicker()
    const firstFile = new File(['content1'], 'first.png', {
      type: 'image/png'
    })
    const secondFile = new File(['content2'], 'second.png', {
      type: 'image/png'
    })

    await act(async () => {
      await result.current.onFilesSelect(toFileList([firstFile, secondFile]))
    })

    expect(onFile).toHaveBeenCalledWith(firstFile)
    expect(onFile).toHaveBeenCalledTimes(1)
  })
})
