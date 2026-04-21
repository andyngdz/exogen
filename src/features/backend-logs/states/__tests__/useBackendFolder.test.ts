import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useBackendFolder } from '../useBackendFolder'

describe('useBackendFolder', () => {
  it('returns onOpenBackendFolder function', () => {
    const { result } = renderHook(() => useBackendFolder())

    expect(result.current.onOpenBackendFolder).toBeDefined()
    expect(typeof result.current.onOpenBackendFolder).toBe('function')
  })

  it('calls electronAPI.backend.openBackendFolder when onOpenBackendFolder is called', () => {
    const { result } = renderHook(() => useBackendFolder())

    result.current.onOpenBackendFolder()

    expect(
      globalThis.window.electronAPI.backend.openBackendFolder
    ).toHaveBeenCalledTimes(1)
  })

  it('returns stable function reference across re-renders', () => {
    const { result, rerender } = renderHook(() => useBackendFolder())

    const firstRef = result.current.onOpenBackendFolder
    rerender()
    const secondRef = result.current.onOpenBackendFolder

    expect(firstRef).toBe(secondRef)
  })
})
