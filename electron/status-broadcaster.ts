import {
  BackendStatusEmitter,
  BackendStatusLevel,
  BackendStatusPayload
} from '@types'
import { BrowserWindow } from 'electron'

const backendStatusHistory: BackendStatusPayload[] = []
const MAX_BACKEND_STATUS_HISTORY = 100

const addBackendStatusToHistory = (payload: BackendStatusPayload) => {
  const clonedPayload: BackendStatusPayload = {
    ...payload,
    commands: payload.commands?.map((command) => ({ ...command }))
  }

  backendStatusHistory.push(clonedPayload)

  if (backendStatusHistory.length > MAX_BACKEND_STATUS_HISTORY) {
    backendStatusHistory.splice(
      0,
      backendStatusHistory.length - MAX_BACKEND_STATUS_HISTORY
    )
  }
}

const getBackendStatusHistory = () => backendStatusHistory

/** Forgets the previous setup run, so a retry replays only its own steps. */
const clearBackendStatusHistory = () => {
  backendStatusHistory.splice(0)
}

const broadcastBackendStatus: BackendStatusEmitter = (payload) => {
  addBackendStatusToHistory(payload)

  const prefix =
    payload.level === BackendStatusLevel.Error
      ? '[Backend Setup][Error]'
      : '[Backend Setup][Info]'

  console.log(`${prefix} ${payload.message}`)

  BrowserWindow.getAllWindows().forEach((window) => {
    if (!window.isDestroyed()) {
      window.webContents.send('backend-setup:status', payload)
    }
  })
}

export {
  addBackendStatusToHistory,
  broadcastBackendStatus,
  clearBackendStatusHistory,
  getBackendStatusHistory
}
