import { SocketEvents } from '@/cores/sockets'
import {
  useGenerationStatusStore,
  useUseImageGenerationStore
} from '@/features/generators'
import { ImageGenerationStepEndResponse } from '@/types'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGeneratorPreviewer } from '../useGeneratorPreviewer'

// Capture the socket handler so tests can deliver step events
let capturedHandlers: Record<string, (data: unknown) => void> = {}

vi.mock('@/cores/sockets', async () => {
  const actual = await vi.importActual('@/cores/sockets')
  return {
    ...actual,
    useSocketEvent: vi.fn((event: string, handler: (data: unknown) => void) => {
      capturedHandlers[event] = handler
    })
  }
})

const stepEnd = (index: number): ImageGenerationStepEndResponse => ({
  index,
  current_step: 20,
  timestep: 0.8,
  image_base64: `step-${index}`
})

const deliverStepEnd = (response: ImageGenerationStepEndResponse) => {
  act(() => {
    capturedHandlers[SocketEvents.IMAGE_GENERATION_STEP_END](response)
  })
}

describe('useGeneratorPreviewer', () => {
  beforeEach(() => {
    capturedHandlers = {}
    useGenerationStatusStore.getState().reset()
    useUseImageGenerationStore.setState({
      imageStepEnds: [],
      items: [],
      nsfw_content_detected: []
    })
  })

  it('returns imageStepEnds and items from the store', () => {
    act(() => {
      useUseImageGenerationStore.getState().onInit(2)
    })

    const { result } = renderHook(() => useGeneratorPreviewer())

    expect(result.current.imageStepEnds).toHaveLength(2)
    expect(result.current.items).toHaveLength(2)
  })

  it('subscribes to IMAGE_GENERATION_STEP_END', async () => {
    const { useSocketEvent } = vi.mocked(await import('@/cores/sockets'))

    renderHook(() => useGeneratorPreviewer())

    expect(useSocketEvent).toHaveBeenCalledWith(
      SocketEvents.IMAGE_GENERATION_STEP_END,
      expect.any(Function),
      expect.any(Array)
    )
  })

  it('stores step previews for a generation this client started', () => {
    act(() => {
      useGenerationStatusStore.getState().onSetIsGenerating(true)
      useUseImageGenerationStore.getState().onInit(2)
    })
    const { result } = renderHook(() => useGeneratorPreviewer())

    deliverStepEnd(stepEnd(1))

    expect(result.current.imageStepEnds[1].image_base64).toBe('step-1')
  })

  it('ignores step previews from a generation another client started', () => {
    const { result } = renderHook(() => useGeneratorPreviewer())

    deliverStepEnd(stepEnd(0))
    deliverStepEnd(stepEnd(3))

    expect(result.current.imageStepEnds).toHaveLength(0)
    expect(result.current.items).toHaveLength(0)
  })
})
