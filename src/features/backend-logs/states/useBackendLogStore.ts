import type { LogEntry } from '@types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const MAX_LOGS = 250

interface BackendLogStore {
  logs: LogEntry[]
  isStreaming: boolean
  addLog: (log: LogEntry) => void
  clearLogs: () => void
  setIsStreaming: (isStreaming: boolean) => void
  reset: () => void
}

const initialState = {
  logs: [],
  isStreaming: false
}

export const useBackendLogStore = create<BackendLogStore>()(
  persist(
    (set) => ({
      ...initialState,

      addLog: (log: LogEntry) => {
        set((state) => {
          const newLogs = [...state.logs, log]

          return {
            logs: newLogs.length > MAX_LOGS ? newLogs.slice(-MAX_LOGS) : newLogs
          }
        })
      },

      clearLogs: () => {
        set({ logs: [] })
      },

      setIsStreaming: (isStreaming: boolean) => {
        set({ isStreaming })
      },

      reset: () => {
        set(initialState)
      }
    }),
    {
      name: 'backend-log-store'
    }
  )
)
