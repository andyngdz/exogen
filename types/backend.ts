// Backend status and command types shared across scripts, electron, and frontend

export enum BackendStatusLevel {
  Info = 'info',
  Error = 'error',
  /** Setup paused because a download needs an internet connection. */
  Offline = 'offline'
}

export interface BackendStatusCommand {
  label: string
  command: string
}

export interface BackendStatusPayload {
  level: BackendStatusLevel
  message: string
  commands?: BackendStatusCommand[]
}

export type BackendStatusEmitter = (payload: BackendStatusPayload) => void
