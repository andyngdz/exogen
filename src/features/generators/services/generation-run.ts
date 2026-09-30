import {
  GenerateBlockInput,
  GenerateBlockReason
} from '@/features/generators/types'
import { ImageGenerationStepEndResponse } from '@/types'
import { isAxiosError } from 'axios'
import {
  filter,
  isArray,
  isObject,
  isString,
  map,
  maxBy
} from 'es-toolkit/compat'

const FALLBACK_MESSAGE = 'The backend did not say why.'

const hasMessage = (entry: unknown): entry is { msg: string } =>
  isObject(entry) && 'msg' in entry && isString(entry.msg)

export class GenerationRunService {
  /**
   * Reads the backend's `detail`: a string for handled errors, or a list of
   * `{ msg }` for FastAPI validation errors (422).
   */
  toFailureMessage(error: unknown): string {
    if (isAxiosError(error)) {
      const detail: unknown = error.response?.data?.detail
      if (isString(detail)) return detail
      if (isArray(detail)) {
        return map(filter(detail, hasMessage), (entry) => entry.msg).join('; ')
      }
    }

    if (error instanceof Error && error.message) return error.message

    return FALLBACK_MESSAGE
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
