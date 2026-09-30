import { StageView, StageViewInput } from '@/features/generator-stage/types'

export class StageViewService {
  /** The one panel the stage shows, highest priority first. */
  toView(input: StageViewInput): StageView {
    if (input.isBackendOffline) return StageView.OFFLINE
    if (input.isModelLoading) return StageView.MODEL_LOADING
    if (input.hasFailure) return StageView.FAILED
    if (!input.hasModel) return StageView.NO_MODEL
    if (!input.hasOutput) return StageView.FIRST_RUN
    return StageView.RESULTS
  }
}

export const stageViewService = new StageViewService()
