/** What the stage shows after a generation request fails. */
export interface GenerationFailure {
  message: string
  /** Highest denoising step reached before the failure, when any arrived. */
  step?: number
}

/** Why the generate action is disabled, in the order the dock checks them. */
export enum GenerateBlockReason {
  BACKEND_OFFLINE = 'Backend offline',
  MODEL_LOADING = 'Waiting for the model',
  NO_MODEL = 'Select a model',
  NO_INPUT_IMAGE = 'Add an input image'
}

export interface GenerateBlockInput {
  isBackendOffline: boolean
  isModelLoading: boolean
  hasModel: boolean
  needsInputImage: boolean
}
