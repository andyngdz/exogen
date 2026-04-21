import type {
  BackendStatusEmitter,
  BackendStatusPayload,
  LogEntry,
  UpdateCheckResult
} from '@types'
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  downloadImage: (url: string) => ipcRenderer.invoke('download-image', url),
  selectFile: (filters?: Electron.FileFilter[]) =>
    ipcRenderer.invoke('select-file', filters),
  onBackendSetupStatus: (listener: BackendStatusEmitter) => {
    const channel = 'backend-setup:status'
    ipcRenderer
      .invoke('backend-setup:get-history')
      .then((history: BackendStatusPayload[]) => {
        history.forEach((payload) => listener(payload))
      })
      .catch(() => {
        // ignore history fetch errors
      })

    const subscription = (
      _event: Electron.IpcRendererEvent,
      payload: BackendStatusPayload
    ) => {
      listener(payload)
    }

    ipcRenderer.on(channel, subscription)

    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  },
  app: {
    getVersion: () => ipcRenderer.invoke('app:get-version')
  },
  backend: {
    getPort: () => ipcRenderer.invoke('backend:get-port'),
    isLogStreaming: () => ipcRenderer.invoke('backend:log-stream-status'),
    onLog: (listener: (logEntry: LogEntry) => void) => {
      const subscription = (
        _: Electron.IpcRendererEvent,
        logEntry: LogEntry
      ) => {
        listener(logEntry)
      }

      ipcRenderer.on('backend:log', subscription)

      return () => {
        ipcRenderer.removeListener('backend:log', subscription)
      }
    },
    openBackendFolder: () => ipcRenderer.invoke('backend:open-folder')
  },
  updater: {
    checkForUpdates: (): Promise<UpdateCheckResult> =>
      ipcRenderer.invoke('updater:check'),
    installUpdate: () => ipcRenderer.invoke('updater:install')
  }
})
