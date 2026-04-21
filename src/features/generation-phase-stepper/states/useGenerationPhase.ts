import {
  GenerationPhase,
  GenerationPhaseResponse,
  SocketEvents,
  useSocketEvent
} from '@/cores/sockets'
import { isEmpty } from 'es-toolkit/compat'
import { useCallback, useMemo } from 'react'
import { PHASE_LABELS } from '../constants'
import { useGenerationPhaseStore } from './useGenerationPhaseStore'

export const useGenerationPhase = () => {
  const { phases, current, onPhaseChange, reset } = useGenerationPhaseStore()

  const steps = useMemo(
    () =>
      phases.map((phase) => ({
        phase,
        label: PHASE_LABELS[phase]
      })),
    [phases]
  )

  const onPhaseChangeEvent = useCallback(
    (data: GenerationPhaseResponse) => {
      const isCompleted = data.current === GenerationPhase.COMPLETED

      if (isCompleted) {
        reset()
        return
      }

      onPhaseChange(data)
    },
    [onPhaseChange, reset]
  )

  useSocketEvent(SocketEvents.GENERATION_PHASE, onPhaseChangeEvent, [
    onPhaseChangeEvent
  ])

  const isVisible = !isEmpty(phases) && !!current

  return { phases, current, steps, isVisible }
}
