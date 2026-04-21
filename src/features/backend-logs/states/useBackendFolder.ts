'use client'

import { useCallback } from 'react'

export const useBackendFolder = () => {
  const onOpenBackendFolder = useCallback(() => {
    globalThis.window.electronAPI.backend.openBackendFolder()
  }, [])

  return {
    onOpenBackendFolder
  }
}
