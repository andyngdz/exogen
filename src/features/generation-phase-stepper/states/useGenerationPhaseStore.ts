import { GenerationPhase, GenerationPhaseResponse } from '@/cores/sockets'
import { create } from 'zustand'

interface GenerationPhaseStoreProps {
  phases: GenerationPhase[]
  current: GenerationPhase | undefined
  onPhaseChange: (response: GenerationPhaseResponse) => void
  reset: VoidFunction
}

export const useGenerationPhaseStore = create<GenerationPhaseStoreProps>()(
  (set, _get, store) => ({
    phases: [],
    current: undefined,

    onPhaseChange: (response) =>
      set({ phases: response.phases, current: response.current }),
    reset: () => set(store.getInitialState())
  })
)
