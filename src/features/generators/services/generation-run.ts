import {
  GenerateBlockInput,
  GenerateBlockReason
} from '@/features/generators/types'
import { apiErrorService } from '@/services/errors'
import { ImageGenerationStepEndResponse } from '@/types'
import { maxBy } from 'es-toolkit/compat'

const FALLBACK_MESSAGE = 'The backend did not say why.'

export class GenerationRunService {
  /**
   * Reads the backend's `detail`: a string for handled errors, or a list of
   * `{ msg }` for FastAPI validation errors (422).
   */
  toFailureMessage(error: unknown): string {
    return apiErrorService.toMessage(error, FALLBACK_MESSAGE)
  }

  /** Highest step any image reached; undefined when no step event arrived. */
  toLastStep(stepEnds: ImageGenerationStepEndResponse[]) {
    const latest = maxBy(stepEnds, (stepEnd) => stepEnd.current_step)
    if (!latest?.current_step) return

    return latest.current_step
  }

  /** The first reason generation cannot start, or undefined when it can. */
  getBlockReason({
    isBackendOffline,
    isModelLoading,
    hasModel,
    needsInputImage
  }: GenerateBlockInput) {
    if (isBackendOffline) return GenerateBlockReason.BACKEND_OFFLINE
    if (isModelLoading) return GenerateBlockReason.MODEL_LOADING
    if (!hasModel) return GenerateBlockReason.NO_MODEL
    if (needsInputImage) return GenerateBlockReason.NO_INPUT_IMAGE
  }
}

export const generationRunService = new GenerationRunService()
