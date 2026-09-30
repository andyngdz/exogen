import { generationRunService } from '@/features/generators/services/generation-run'
import { GenerationFailure } from '@/features/generators/types'
import { create } from 'zustand'
import { useUseImageGenerationStore } from './useImageGenerationResponseStores'

export interface GenerationErrorState {
  failure?: GenerationFailure
}

export const useGenerationErrorStore = create<GenerationErrorState>()(
  () => ({})
)

export const GENERATION_ERROR_ACTIONS = {
  /** Stores the failure with the backend's reason and the last step reached. */
  recordFailure: (error: unknown) =>
    useGenerationErrorStore.setState({
      failure: {
        message: generationRunService.toFailureMessage(error),
        step: generationRunService.toLastStep(
          useUseImageGenerationStore.getState().imageStepEnds
        )
      }
    }),
  clear: () => useGenerationErrorStore.setState({ failure: undefined })
}
