import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  useDownloadWatcherStore,
  UseDownloadWatcherStore
} from '../useDownloadWatchStore'

describe('useDownloadWatcherStore', () => {
  it('initializes with undefined model_id and step', () => {
    const { result } = renderHook(() => useDownloadWatcherStore())

    expect(result.current.model_id).toBeUndefined()
    expect(result.current.step).toBeUndefined()
  })

  it('provides all required functions', () => {
    const { result } = renderHook(() => useDownloadWatcherStore())

    expect(result.current.onSetModelId).toBeInstanceOf(Function)
    expect(result.current.onUpdateStep).toBeInstanceOf(Function)
    expect(result.current.onResetStep).toBeInstanceOf(Function)
    expect(result.current.onResetModelId).toBeInstanceOf(Function)
  })

  it('sets model_id when onSetModelId is called', () => {
    const { result } = renderHook(() => useDownloadWatcherStore())

    act(() => {
      result.current.onSetModelId('test-model-123')
    })

    expect(result.current.model_id).toBe('test-model-123')
  })

  it('updates step when onUpdateStep is called', () => {
    const { result } = renderHook(() => useDownloadWatcherStore())

    const mockStep = {
      model_id: 'model-456',
      step: 3,
      total: 10,
      downloaded_size: 3145728,
      total_downloaded_size: 10485760,
      phase: 'downloading',
      current_file: 'model.safetensors'
    }

    act(() => {
      result.current.onUpdateStep(mockStep)
    })

    expect(result.current.step).toEqual(mockStep)
  })

  it('updates step with different values on subsequent calls', () => {
    const { result } = renderHook(() => useDownloadWatcherStore())

    const firstStep = {
      model_id: 'model-1',
      step: 1,
      total: 5,
      downloaded_size: 1048576,
      total_downloaded_size: 5242880,
      phase: 'downloading'
    }

    const secondStep = {
      model_id: 'model-1',
      step: 3,
      total: 5,
      downloaded_size: 3145728,
      total_downloaded_size: 5242880,
      phase: 'downloading'
    }

    act(() => {
      result.current.onUpdateStep(firstStep)
    })

    expect(result.current.step).toEqual(firstStep)

    act(() => {
      result.current.onUpdateStep(secondStep)
    })

    expect(result.current.step).toEqual(secondStep)
  })

  it('resets step to undefined when onResetStep is called', () => {
    const { result } = renderHook(() => useDownloadWatcherStore())

    const mockStep = {
      model_id: 'model-789',
      step: 5,
      total: 10,
      downloaded_size: 5242880,
      total_downloaded_size: 10485760,
      phase: 'downloading'
    }

    act(() => {
      result.current.onUpdateStep(mockStep)
    })

    expect(result.current.step).toEqual(mockStep)

    act(() => {
      result.current.onResetStep()
    })

    expect(result.current.step).toBeUndefined()
  })

  it('resets model_id to undefined when onResetModelId is called', () => {
    const { result } = renderHook(() => useDownloadWatcherStore())

    act(() => {
      result.current.onSetModelId('test-model-xyz')
    })

    expect(result.current.model_id).toBe('test-model-xyz')

    act(() => {
      result.current.onResetModelId()
    })

    expect(result.current.model_id).toBeUndefined()
  })

  it('can set model_id and step independently', () => {
    const { result } = renderHook(() => useDownloadWatcherStore())

    const mockStep = {
      model_id: 'model-a',
      step: 2,
      total: 5,
      downloaded_size: 2097152,
      total_downloaded_size: 5242880,
      phase: 'downloading'
    }

    act(() => {
      result.current.onSetModelId('model-b')
      result.current.onUpdateStep(mockStep)
    })

    expect(result.current.model_id).toBe('model-b')
    expect(result.current.step).toEqual(mockStep)
  })

  it('can reset model_id and step independently', () => {
    const { result } = renderHook(() => useDownloadWatcherStore())

    const mockStep = {
      model_id: 'model-c',
      step: 4,
      total: 10,
      downloaded_size: 4194304,
      total_downloaded_size: 10485760,
      phase: 'downloading'
    }

    act(() => {
      result.current.onSetModelId('model-d')
      result.current.onUpdateStep(mockStep)
    })

    expect(result.current.model_id).toBe('model-d')
    expect(result.current.step).toEqual(mockStep)

    act(() => {
      result.current.onResetModelId()
    })

    expect(result.current.model_id).toBeUndefined()
    expect(result.current.step).toEqual(mockStep) // step should remain

    act(() => {
      result.current.onResetStep()
    })

    expect(result.current.model_id).toBeUndefined()
    expect(result.current.step).toBeUndefined()
  })

  it('maintains type safety with UseDownloadWatcherStore interface', () => {
    const { result } = renderHook(() => useDownloadWatcherStore())

    // This test ensures the hook returns the correct type
    const state: UseDownloadWatcherStore = result.current

    expect(state).toHaveProperty('model_id')
    expect(state).toHaveProperty('step')
    expect(state).toHaveProperty('onSetModelId')
    expect(state).toHaveProperty('onUpdateStep')
    expect(state).toHaveProperty('onResetStep')
    expect(state).toHaveProperty('onResetModelId')
  })
})
