import { GenerationPhase, GenerationPhaseResponse } from '@/cores/sockets'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useGenerationPhaseStore } from '../useGenerationPhaseStore'

describe('useGenerationPhaseStore', () => {
  beforeEach(() => {
    useGenerationPhaseStore.getState().reset()
  })

  it('has initial state with empty phases and undefined current', () => {
    const { result } = renderHook(() => useGenerationPhaseStore())

    expect(result.current.phases).toEqual([])
    expect(result.current.current).toBeUndefined()
  })

  it('onPhaseChange updates phases and current', () => {
    const { result } = renderHook(() => useGenerationPhaseStore())

    const response: GenerationPhaseResponse = {
      phases: [GenerationPhase.IMAGE_GENERATION, GenerationPhase.UPSCALING],
      current: GenerationPhase.IMAGE_GENERATION
    }

    act(() => {
      result.current.onPhaseChange(response)
    })

    expect(result.current.phases).toEqual([
      GenerationPhase.IMAGE_GENERATION,
      GenerationPhase.UPSCALING
    ])
    expect(result.current.current).toBe(GenerationPhase.IMAGE_GENERATION)
  })

  it('onPhaseChange updates current phase to upscaling', () => {
    const { result } = renderHook(() => useGenerationPhaseStore())

    const response: GenerationPhaseResponse = {
      phases: [GenerationPhase.IMAGE_GENERATION, GenerationPhase.UPSCALING],
      current: GenerationPhase.UPSCALING
    }

    act(() => {
      result.current.onPhaseChange(response)
    })

    expect(result.current.current).toBe(GenerationPhase.UPSCALING)
  })

  it('reset restores initial state', () => {
    const { result } = renderHook(() => useGenerationPhaseStore())

    const response: GenerationPhaseResponse = {
      phases: [GenerationPhase.IMAGE_GENERATION],
      current: GenerationPhase.IMAGE_GENERATION
    }

    act(() => {
      result.current.onPhaseChange(response)
    })

    expect(result.current.phases).toHaveLength(1)
    expect(result.current.current).toBeDefined()

    act(() => {
      result.current.reset()
    })

    expect(result.current.phases).toEqual([])
    expect(result.current.current).toBeUndefined()
  })
})
