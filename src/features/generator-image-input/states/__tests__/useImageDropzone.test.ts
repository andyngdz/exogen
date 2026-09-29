import { act, renderHook } from '@testing-library/react'
import type { DropItem, DropZoneProps } from 'react-aria-components'
import { describe, expect, it, vi } from 'vitest'

import { useImageDropzone } from '../useImageDropzone'

type ImageDropEvent = Parameters<NonNullable<DropZoneProps['onDrop']>>[0]

const createDropEvent = (items: DropItem[]): ImageDropEvent => ({
  type: 'drop',
  x: 0,
  y: 0,
  dropOperation: 'copy',
  items
})

const createFileItem = (file: File): DropItem => ({
  kind: 'file',
  type: file.type,
  name: file.name,
  getFile: async () => file,
  getText: async () => ''
})

const createTextItem = (text: string): DropItem => ({
  kind: 'text',
  types: new Set(['text/plain']),
  getText: async () => text
})

const renderDropzone = () => {
  const onFile = vi
    .fn<(file: File) => Promise<void>>()
    .mockResolvedValue(undefined)
  const { result } = renderHook(() => useImageDropzone({ onFile }))

  return { onFile, result }
}

describe('useImageDropzone', () => {
  it('toggles drag active state on drop enter and exit', () => {
    const { result } = renderDropzone()

    act(() => {
      result.current.onDropEnter()
    })
    expect(result.current.isDragActive).toBe(true)

    act(() => {
      result.current.onDropExit()
    })
    expect(result.current.isDragActive).toBe(false)
  })

  it('does nothing when the drop carries no file', async () => {
    const { onFile, result } = renderDropzone()

    await act(async () => {
      await result.current.onDrop(createDropEvent([createTextItem('hello')]))
    })

    expect(onFile).not.toHaveBeenCalled()
    expect(result.current.isDragActive).toBe(false)
  })

  it('calls onFile with the first dropped file and clears drag active state', async () => {
    const { onFile, result } = renderDropzone()
    const firstFile = new File(['a'], 'a.png', { type: 'image/png' })
    const secondFile = new File(['b'], 'b.png', { type: 'image/png' })

    act(() => {
      result.current.onDropEnter()
    })

    await act(async () => {
      await result.current.onDrop(
        createDropEvent([
          createTextItem('ignored'),
          createFileItem(firstFile),
          createFileItem(secondFile)
        ])
      )
    })

    expect(onFile).toHaveBeenCalledTimes(1)
    expect(onFile).toHaveBeenCalledWith(firstFile)
    expect(result.current.isDragActive).toBe(false)
  })
})
