export enum BackendStepRowState {
  DONE = 'done',
  RUNNING = 'running',
  FAILED = 'failed'
}

export interface BackendStepRow {
  id: string
  message: string
  time: string
  state: BackendStepRowState
}
