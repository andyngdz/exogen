import { ModelLoadPhase, ModelLoadProgressResponse } from '@/cores/sockets'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useModelLoadProgressStore } from '../useModelLoadProgressStore'

describe('useModelLoadProgressStore', () => {
  beforeEach(() => {
    useModelLoadProgressStore.getState().reset()
  })

  it('has initial state with undefined values', () => {
    const { result } = renderHook(() => useModelLoadProgressStore())

    expect(result.current.model_id).toBeUndefined()
    expect(result.current.progress).toBeUndefined()
  })

  it('onSetModelId updates model_id', () => {
    const { result } = renderHook(() => useModelLoadProgressStore())

    act(() => {
      result.current.onSetModelId('model-123')
    })

    expect(result.current.model_id).toBe('model-123')
  })

  it('onUpdateProgress updates progress', () => {
    const { result } = renderHook(() => useModelLoadProgressStore())

    const progress: ModelLoadProgressResponse = {
      model_id: 'model-456',
      step: 5,
      total: 9,
      phase: ModelLoadPhase.LOADING_MODEL,
      message: 'Loading model weights...'
    }

    act(() => {
      result.current.onUpdateProgress(progress)
    })

    expect(result.current.progress).toEqual(progress)
  })

  it('reset restores initial state', () => {
    const { result } = renderHook(() => useModelLoadProgressStore())

    const progress: ModelLoadProgressResponse = {
      model_id: 'model-789',
      step: 9,
      total: 9,
      phase: ModelLoadPhase.OPTIMIZATION,
      message: 'Finalizing model setup...'
    }

    act(() => {
      result.current.onSetModelId('model-789')
      result.current.onUpdateProgress(progress)
    })

    expect(result.current.model_id).toBe('model-789')
    expect(result.current.progress).toEqual(progress)

    act(() => {
      result.current.reset()
    })

    expect(result.current.model_id).toBeUndefined()
    expect(result.current.progress).toBeUndefined()
  })
})
