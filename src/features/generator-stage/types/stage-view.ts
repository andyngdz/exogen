export enum StageView {
  OFFLINE = 'offline',
  MODEL_LOADING = 'model-loading',
  FAILED = 'failed',
  NO_MODEL = 'no-model',
  FIRST_RUN = 'first-run',
  RESULTS = 'results'
}

export interface StageViewInput {
  isBackendOffline: boolean
  isModelLoading: boolean
  hasFailure: boolean
  hasModel: boolean
  hasOutput: boolean
}
