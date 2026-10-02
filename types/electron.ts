// Electron API types shared between main process, preload, and frontend

import { BackendStatusEmitter } from './backend'
import { LogEntry } from './logging'
import { UpdateCheckResult, UpdaterState } from './update'

export interface ElectronAPI {
  downloadImage: (url: string) => Promise<void>
  selectFile: (filters?: Electron.FileFilter[]) => Promise<string | undefined>
  onBackendSetupStatus: (listener: BackendStatusEmitter) => () => void
  app: {
    getVersion: () => Promise<string>
  }
  backend: {
    getPort: () => Promise<number>
    isLogStreaming: () => Promise<boolean>
    onLog: (listener: (logEntry: LogEntry) => void) => () => void
    openBackendFolder: () => Promise<string>
    retrySetup: () => Promise<void>
  }
  updater: {
    checkForUpdates: () => Promise<UpdateCheckResult>
    installUpdate: () => Promise<void>
    onState: (listener: (state: UpdaterState) => void) => () => void
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
