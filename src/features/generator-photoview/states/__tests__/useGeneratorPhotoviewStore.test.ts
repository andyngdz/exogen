import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useGeneratorPhotoviewStore } from '../useGeneratorPhotoviewStore'
import {
  useGenerationStatusStore,
  useUseImageGenerationStore
} from '@/features/generators'

describe('useGeneratorPhotoviewStore', () => {
  beforeEach(() => {
    useGeneratorPhotoviewStore.setState({
      isOpen: false,
      currentIndex: 0
    })
    useGenerationStatusStore.setState({ isGenerating: false })
    useUseImageGenerationStore.setState({
      items: [],
      imageStepEnds: [],
      nsfw_content_detected: []
    } as never)
  })

  it('should have initial state with modal closed', () => {
    const { result } = renderHook(() => useGeneratorPhotoviewStore())

    expect(result.current.isOpen).toBe(false)
    expect(result.current.currentIndex).toBe(0)
  })

  it('should open photoview with index', () => {
    useGenerationStatusStore.setState({ isGenerating: false })
    useUseImageGenerationStore.setState({
      items: [
        { path: 'images/a.png', file_name: 'a.png' },
        { path: 'images/b.png', file_name: 'b.png' },
        { path: 'images/c.png', file_name: 'c.png' }
      ]
    } as never)

    const { result } = renderHook(() => useGeneratorPhotoviewStore())

    act(() => {
      result.current.openPhotoview(2)
    })

    expect(result.current.isOpen).toBe(true)
    expect(result.current.currentIndex).toBe(2)
  })

  it('should not open photoview while generating', () => {
    useGenerationStatusStore.setState({ isGenerating: true })
    useUseImageGenerationStore.setState({
      items: [{ path: 'images/a.png', file_name: 'a.png' }]
    } as never)

    const { result } = renderHook(() => useGeneratorPhotoviewStore())

    act(() => {
      result.current.openPhotoview(0)
    })

    expect(result.current.isOpen).toBe(false)
  })

  it('should not open photoview when image path is missing', () => {
    useGenerationStatusStore.setState({ isGenerating: false })
    useUseImageGenerationStore.setState({
      items: [{ path: '', file_name: 'a.png' }]
    } as never)

    const { result } = renderHook(() => useGeneratorPhotoviewStore())

    act(() => {
      result.current.openPhotoview(0)
    })

    expect(result.current.isOpen).toBe(false)
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
    useUseImageGenerationStore.setState({
      items: [
        { path: 'images/a.png', file_name: 'a.png' },
        { path: 'images/b.png', file_name: 'b.png' }
      ]
    } as never)

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
