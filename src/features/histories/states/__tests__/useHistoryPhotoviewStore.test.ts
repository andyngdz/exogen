import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useHistoryPhotoviewStore } from '../useHistoryPhotoviewStore'

describe('useHistoryPhotoviewStore', () => {
  it('should have initial state with modal closed', () => {
    const { result } = renderHook(() => useHistoryPhotoviewStore())

    expect(result.current.isOpen).toBe(false)
    expect(result.current.currentHistoryId).toBe(null)
  })

  it('should open photoview with history id', () => {
    const { result } = renderHook(() => useHistoryPhotoviewStore())

    act(() => {
      result.current.openPhotoview(123)
    })

    expect(result.current.isOpen).toBe(true)
    expect(result.current.currentHistoryId).toBe(123)
  })

  it('should close photoview and reset state', () => {
    const { result } = renderHook(() => useHistoryPhotoviewStore())

    act(() => {
      result.current.openPhotoview(456)
    })

    expect(result.current.isOpen).toBe(true)
    expect(result.current.currentHistoryId).toBe(456)

    act(() => {
      result.current.closePhotoview()
    })

    expect(result.current.isOpen).toBe(false)
    expect(result.current.currentHistoryId).toBe(null)
  })

  it('should update history id when opening with different id', () => {
    const { result } = renderHook(() => useHistoryPhotoviewStore())

    act(() => {
      result.current.openPhotoview(100)
    })

    expect(result.current.currentHistoryId).toBe(100)

    act(() => {
      result.current.openPhotoview(200)
    })

    expect(result.current.isOpen).toBe(true)
    expect(result.current.currentHistoryId).toBe(200)
  })
})
