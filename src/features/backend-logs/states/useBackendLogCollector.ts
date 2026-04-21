'use client'

import { useEffect } from 'react'
import { useBackendLogStore } from './useBackendLogStore'

export const useBackendLogCollector = () => {
  const { addLog, setIsStreaming } = useBackendLogStore()

  useEffect(() => {
    globalThis.window.electronAPI.backend.isLogStreaming().then(setIsStreaming)

    const unsubscribe = globalThis.window.electronAPI.backend.onLog((log) => {
      addLog(log)
    })

    return unsubscribe
  }, [addLog, setIsStreaming])
}
