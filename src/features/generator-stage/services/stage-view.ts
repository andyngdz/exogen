import { StageView, StageViewInput } from '@/features/generator-stage/types'

export class StageViewService {
  /** The one panel the stage shows, highest priority first. */
  toView(input: StageViewInput): StageView {
    if (input.isBackendOffline) return StageView.OFFLINE
    if (input.isModelLoading) {
      // A load keeps the last preview on screen, dimmed, under its progress.
      if (input.hasOutput) return StageView.MODEL_LOADING_OVER_RESULTS
      return StageView.MODEL_LOADING
    }
    if (input.hasFailure) return StageView.FAILED
    if (!input.hasModel) return StageView.NO_MODEL
    // Image to image needs the input slot before its first run, and only the
    // results view has one.
    if (!input.hasOutput && !input.isImageMode) return StageView.FIRST_RUN
    return StageView.RESULTS
  }
}

export const stageViewService = new StageViewService()
