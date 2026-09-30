export class StageFailureService {
  /** Heading for the failure panel: the last step reached, out of the run's steps when known. */
  toTitle(step?: number, totalSteps?: number): string {
    if (!step) return 'Generation failed'
    if (!totalSteps) return `Generation failed at step ${step}`
    return `Generation failed at step ${step} of ${totalSteps}`
  }
}

export const stageFailureService = new StageFailureService()
