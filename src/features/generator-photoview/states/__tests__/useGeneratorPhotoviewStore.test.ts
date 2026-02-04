import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useGeneratorPhotoviewStore } from '../useGeneratorPhotoviewStore'

describe('useGeneratorPhotoviewStore', () => {
  it('should have initial state with modal closed', () => {
    const { result } = renderHook(() => useGeneratorPhotoviewStore())

    expect(result.current.isOpen).toBe(false)
    expect(result.current.currentIndex).toBe(0)
  })

  it('should open photoview with index', () => {
    const { result } = renderHook(() => useGeneratorPhotoviewStore())

    act(() => {
      result.current.openPhotoview(2)
    })

    expect(result.current.isOpen).toBe(true)
    expect(result.current.currentIndex).toBe(2)
  })

  it('should update current index', () => {
    const { result } = renderHook(() => useGeneratorPhotoviewStore())

    act(() => {
      result.current.openPhotoview(0)
    })

    act(() => {
      result.current.setCurrentIndex(3)
    })

    expect(result.current.currentIndex).toBe(3)
  })

  it('should close photoview and reset state', () => {
    const { result } = renderHook(() => useGeneratorPhotoviewStore())

    act(() => {
      result.current.openPhotoview(1)
    })

    expect(result.current.isOpen).toBe(true)
    expect(result.current.currentIndex).toBe(1)

    act(() => {
      result.current.closePhotoview()
    })

    expect(result.current.isOpen).toBe(false)
    expect(result.current.currentIndex).toBe(0)
  })
})
