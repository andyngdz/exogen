import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { imageInputService } from '../../services'
import { useImagePaste } from '../useImagePaste'

describe('useImagePaste', () => {
  it('subscribes and unsubscribes to paste events', () => {
    const onFile = vi.fn()
    const addSpy = vi.spyOn(document, 'addEventListener')
    const removeSpy = vi.spyOn(document, 'removeEventListener')

    const { unmount } = renderHook(() => useImagePaste({ onFile }))

    expect(addSpy).toHaveBeenCalledWith('paste', expect.any(Function))

    unmount()

    expect(removeSpy).toHaveBeenCalledWith('paste', expect.any(Function))
  })

  it('calls onFile when clipboard has an image', () => {
    const onFile = vi.fn()

    const addSpy = vi
      .spyOn(document, 'addEventListener')
      .mockImplementation(() => undefined)
    vi.spyOn(document, 'removeEventListener').mockImplementation(
      () => undefined
    )

    const file = new File(['a'], 'a.png', { type: 'image/png' })
    vi.spyOn(imageInputService, 'clipboardImageFile').mockReturnValue(file)

    let pasteListener: ((event: Event) => void) | undefined
    addSpy.mockImplementation((type, listener) => {
      if (type === 'paste') pasteListener = listener as (event: Event) => void
    })

    renderHook(() => useImagePaste({ onFile }))

    pasteListener?.({} as ClipboardEvent)

    expect(onFile).toHaveBeenCalledWith(file)
  })

  it('does not call onFile when clipboard has no image', () => {
    const onFile = vi.fn()

    const addSpy = vi
      .spyOn(document, 'addEventListener')
      .mockImplementation(() => undefined)
    vi.spyOn(document, 'removeEventListener').mockImplementation(
      () => undefined
    )

    vi.spyOn(imageInputService, 'clipboardImageFile').mockReturnValue(undefined)

    let pasteListener: ((event: Event) => void) | undefined
    addSpy.mockImplementation((type, listener) => {
      if (type === 'paste') pasteListener = listener as (event: Event) => void
    })

    renderHook(() => useImagePaste({ onFile }))

    pasteListener?.({} as ClipboardEvent)

    expect(onFile).not.toHaveBeenCalled()
  })
})
