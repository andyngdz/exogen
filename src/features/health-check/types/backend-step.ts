export enum BackendStepRowState {
  DONE = 'done',
  RUNNING = 'running',
  FAILED = 'failed',
  OFFLINE = 'offline'
}

/** Where the backend setup stands, read from its newest message. */
export enum BackendStepPhase {
  RUNNING = 'running',
  FAILED = 'failed',
  OFFLINE = 'offline'
}

export interface BackendStepRow {
  id: string
  message: string
  time: string
  state: BackendStepRowState
}
