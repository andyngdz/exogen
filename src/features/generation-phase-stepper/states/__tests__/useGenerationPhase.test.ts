import {
  GenerationPhase,
  GenerationPhaseResponse,
  SocketEvents,
  useSocketEvent
} from '@/cores/sockets'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PHASE_LABELS } from '../../constants'
import { useGenerationPhase } from '../useGenerationPhase'
import * as useGenerationPhaseStoreModule from '../useGenerationPhaseStore'

type SocketEventHandler = (data: GenerationPhaseResponse) => void

let capturedHandler: SocketEventHandler | null = null

vi.mock('@/cores/sockets', async () => {
  const actual = await vi.importActual('@/cores/sockets')
  return {
    ...actual,
    useSocketEvent: vi.fn(
      (event: string, handler: SocketEventHandler, _deps: unknown[]) => {
        if (
          event ===
          (actual as typeof import('@/cores/sockets')).SocketEvents
            .GENERATION_PHASE
        ) {
          capturedHandler = handler
        }
      }
    )
  }
})

const mockUseSocketEvent = vi.mocked(useSocketEvent)

vi.mock('../useGenerationPhaseStore', () => ({
  useGenerationPhaseStore: vi.fn()
}))

describe('useGenerationPhase', () => {
  const mockUseGenerationPhaseStore = vi.mocked(
    useGenerationPhaseStoreModule.useGenerationPhaseStore
  )

  beforeEach(() => {
    vi.clearAllMocks()
    capturedHandler = null

    mockUseGenerationPhaseStore.mockReturnValue({
      phases: [],
      current: undefined,
      onPhaseChange: vi.fn(),
      reset: vi.fn()
    })
  })

  describe('isVisible', () => {
    it('returns false when phases is empty and current is undefined', () => {
      const { result } = renderHook(() => useGenerationPhase())

      expect(result.current.isVisible).toBe(false)
    })

    it('returns true when phases has items and current is defined', () => {
      mockUseGenerationPhaseStore.mockReturnValue({
        phases: [GenerationPhase.IMAGE_GENERATION],
        current: GenerationPhase.IMAGE_GENERATION,
        onPhaseChange: vi.fn(),
        reset: vi.fn()
      })

      const { result } = renderHook(() => useGenerationPhase())

      expect(result.current.isVisible).toBe(true)
    })

    it('returns false when only phases has items', () => {
      mockUseGenerationPhaseStore.mockReturnValue({
        phases: [GenerationPhase.IMAGE_GENERATION],
        current: undefined,
        onPhaseChange: vi.fn(),
        reset: vi.fn()
      })

      const { result } = renderHook(() => useGenerationPhase())

      expect(result.current.isVisible).toBe(false)
    })

    it('returns false when only current is defined', () => {
      mockUseGenerationPhaseStore.mockReturnValue({
        phases: [],
        current: GenerationPhase.IMAGE_GENERATION,
        onPhaseChange: vi.fn(),
        reset: vi.fn()
      })

      const { result } = renderHook(() => useGenerationPhase())

      expect(result.current.isVisible).toBe(false)
    })
  })

  describe('phases and current', () => {
    it('returns phases from store', () => {
      const phases = [
        GenerationPhase.IMAGE_GENERATION,
        GenerationPhase.UPSCALING
      ]
      mockUseGenerationPhaseStore.mockReturnValue({
        phases,
        current: GenerationPhase.IMAGE_GENERATION,
        onPhaseChange: vi.fn(),
        reset: vi.fn()
      })

      const { result } = renderHook(() => useGenerationPhase())

      expect(result.current.phases).toEqual(phases)
    })

    it('returns current from store', () => {
      mockUseGenerationPhaseStore.mockReturnValue({
        phases: [GenerationPhase.IMAGE_GENERATION, GenerationPhase.UPSCALING],
        current: GenerationPhase.UPSCALING,
        onPhaseChange: vi.fn(),
        reset: vi.fn()
      })

      const { result } = renderHook(() => useGenerationPhase())

      expect(result.current.current).toBe(GenerationPhase.UPSCALING)
    })
  })

  describe('steps', () => {
    it('returns empty steps when phases is empty', () => {
      const { result } = renderHook(() => useGenerationPhase())

      expect(result.current.steps).toEqual([])
    })

    it('returns steps with labels for each phase', () => {
      mockUseGenerationPhaseStore.mockReturnValue({
        phases: [GenerationPhase.IMAGE_GENERATION, GenerationPhase.UPSCALING],
        current: GenerationPhase.IMAGE_GENERATION,
        onPhaseChange: vi.fn(),
        reset: vi.fn()
      })

      const { result } = renderHook(() => useGenerationPhase())

      expect(result.current.steps).toEqual([
        {
          phase: GenerationPhase.IMAGE_GENERATION,
          label: PHASE_LABELS[GenerationPhase.IMAGE_GENERATION]
        },
        {
          phase: GenerationPhase.UPSCALING,
          label: PHASE_LABELS[GenerationPhase.UPSCALING]
        }
      ])
    })
  })

  describe('integration', () => {
    it('provides all expected properties', () => {
      mockUseGenerationPhaseStore.mockReturnValue({
        phases: [GenerationPhase.IMAGE_GENERATION],
        current: GenerationPhase.IMAGE_GENERATION,
        onPhaseChange: vi.fn(),
        reset: vi.fn()
      })

      const { result } = renderHook(() => useGenerationPhase())

      expect(result.current).toHaveProperty('phases')
      expect(result.current).toHaveProperty('current')
      expect(result.current).toHaveProperty('steps')
      expect(result.current).toHaveProperty('isVisible')
    })
  })

  describe('socket event handler', () => {
    it('subscribes to GENERATION_PHASE socket event', () => {
      renderHook(() => useGenerationPhase())

      expect(mockUseSocketEvent).toHaveBeenCalledWith(
        SocketEvents.GENERATION_PHASE,
        expect.any(Function),
        expect.any(Array)
      )
    })

    it('calls reset when phase is COMPLETED', () => {
      const mockReset = vi.fn()
      const mockOnPhaseChange = vi.fn()

      mockUseGenerationPhaseStore.mockReturnValue({
        phases: [GenerationPhase.IMAGE_GENERATION],
        current: GenerationPhase.IMAGE_GENERATION,
        onPhaseChange: mockOnPhaseChange,
        reset: mockReset
      })

      renderHook(() => useGenerationPhase())

      const completedData: GenerationPhaseResponse = {
        phases: [GenerationPhase.IMAGE_GENERATION],
        current: GenerationPhase.COMPLETED
      }

      capturedHandler?.(completedData)

      expect(mockReset).toHaveBeenCalled()
      expect(mockOnPhaseChange).not.toHaveBeenCalled()
    })

    it('calls onPhaseChange when phase is not COMPLETED', () => {
      const mockReset = vi.fn()
      const mockOnPhaseChange = vi.fn()

      mockUseGenerationPhaseStore.mockReturnValue({
        phases: [],
        current: undefined,
        onPhaseChange: mockOnPhaseChange,
        reset: mockReset
      })

      renderHook(() => useGenerationPhase())

      const phaseData: GenerationPhaseResponse = {
        phases: [GenerationPhase.IMAGE_GENERATION, GenerationPhase.UPSCALING],
        current: GenerationPhase.IMAGE_GENERATION
      }

      capturedHandler?.(phaseData)

      expect(mockOnPhaseChange).toHaveBeenCalledWith(phaseData)
      expect(mockReset).not.toHaveBeenCalled()
    })
  })
})
