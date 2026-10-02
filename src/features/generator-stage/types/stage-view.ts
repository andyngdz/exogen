export enum StageView {
  OFFLINE = 'offline',
  MODEL_LOADING = 'model-loading',
  MODEL_LOADING_OVER_RESULTS = 'model-loading-over-results',
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
  isImageMode: boolean
}
