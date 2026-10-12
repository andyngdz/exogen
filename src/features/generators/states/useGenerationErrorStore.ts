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
  /**
   * Stores a failure from before the generation request, such as creating the
   * history entry. No step belongs to it: the step ends still hold the last run.
   */
  recordStartFailure: (error: unknown) =>
    useGenerationErrorStore.setState({
      failure: { message: generationRunService.toFailureMessage(error) }
    }),
  clear: () => useGenerationErrorStore.setState({ failure: undefined })
}
