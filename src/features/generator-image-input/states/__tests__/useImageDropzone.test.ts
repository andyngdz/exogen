import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { useImageDropzone } from '../useImageDropzone'

describe('useImageDropzone', () => {
  it('toggles drag active state on enter/leave', () => {
    const onFile = vi.fn()
    const { result } = renderHook(() => useImageDropzone({ onFile }))

    const event = {
      preventDefault: vi.fn()
    } as unknown as React.DragEvent<HTMLElement>

    act(() => {
      result.current.onDragEnter(event)
    })
    expect(result.current.isDragActive).toBe(true)

    act(() => {
      result.current.onDragLeave(event)
    })
    expect(result.current.isDragActive).toBe(false)
  })

  it('does nothing when dropped files are empty', () => {
    const onFile = vi.fn()
    const { result } = renderHook(() => useImageDropzone({ onFile }))

    const dropEvent = {
      preventDefault: vi.fn(),
      dataTransfer: { files: { length: 0 } }
    } as unknown as React.DragEvent<HTMLElement>

    act(() => {
      result.current.onDrop(dropEvent)
    })

    expect(onFile).not.toHaveBeenCalled()
    expect(result.current.isDragActive).toBe(false)
  })

  it('calls onFile when a file is dropped and clears drag active state', () => {
    const onFile = vi.fn()
    const { result } = renderHook(() => useImageDropzone({ onFile }))

    const file = new File(['a'], 'a.png', { type: 'image/png' })
    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => (index === 0 ? file : null)
    } as unknown as FileList

    const dragEvent = {
      preventDefault: vi.fn()
    } as unknown as React.DragEvent<HTMLElement>

    act(() => {
      result.current.onDragOver(dragEvent)
    })

    const dropEvent = {
      preventDefault: vi.fn(),
      dataTransfer: { files: fileList }
    } as unknown as React.DragEvent<HTMLElement>

    act(() => {
      result.current.onDrop(dropEvent)
    })

    expect(onFile).toHaveBeenCalledWith(file)
    expect(result.current.isDragActive).toBe(false)
  })

  it('calls preventDefault on onDragEnter', () => {
    const onFile = vi.fn()
    const { result } = renderHook(() => useImageDropzone({ onFile }))

    const event = {
      preventDefault: vi.fn()
    } as unknown as React.DragEvent<HTMLElement>

    act(() => {
      result.current.onDragEnter(event)
    })

    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('calls preventDefault on onDragOver', () => {
    const onFile = vi.fn()
    const { result } = renderHook(() => useImageDropzone({ onFile }))

    const event = {
      preventDefault: vi.fn()
    } as unknown as React.DragEvent<HTMLElement>

    act(() => {
      result.current.onDragOver(event)
    })

    expect(event.preventDefault).toHaveBeenCalled()
    expect(result.current.isDragActive).toBe(true)
  })

  it('calls preventDefault on onDragLeave', () => {
    const onFile = vi.fn()
    const { result } = renderHook(() => useImageDropzone({ onFile }))

    const event = {
      preventDefault: vi.fn()
    } as unknown as React.DragEvent<HTMLElement>

    act(() => {
      result.current.onDragLeave(event)
    })

    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('calls preventDefault on onDrop', () => {
    const onFile = vi.fn()
    const { result } = renderHook(() => useImageDropzone({ onFile }))

    const event = {
      preventDefault: vi.fn(),
      dataTransfer: { files: { length: 0 } }
    } as unknown as React.DragEvent<HTMLElement>

    act(() => {
      result.current.onDrop(event)
    })

    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('handles sequential drag enter and leave events', () => {
    const onFile = vi.fn()
    const { result } = renderHook(() => useImageDropzone({ onFile }))

    const event = {
      preventDefault: vi.fn()
    } as unknown as React.DragEvent<HTMLElement>

    // First enter
    act(() => {
      result.current.onDragEnter(event)
    })
    expect(result.current.isDragActive).toBe(true)

    // Second enter (should still be active)
    act(() => {
      result.current.onDragEnter(event)
    })
    expect(result.current.isDragActive).toBe(true)

    // Leave
    act(() => {
      result.current.onDragLeave(event)
    })
    expect(result.current.isDragActive).toBe(false)
  })
})
