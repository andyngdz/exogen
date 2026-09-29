'use client'

import { toast } from '@heroui/react'
import { useCallback, useEffect, useState } from 'react'

export const useUpdaterSettings = () => {
  const [version, setVersion] = useState('Development Build')
  const [isChecking, setIsChecking] = useState(false)

  const onGetVersion = useCallback(async () => {
    const api = globalThis.window.electronAPI
    if (!api) return

    const version = await api.app.getVersion()
    setVersion(version)
  }, [])

  const onCheck = useCallback(async () => {
    setIsChecking(true)

    try {
      const result =
        await globalThis.window.electronAPI.updater.checkForUpdates()

      if (result && !result.updateAvailable) {
        toast.success("You're already on the latest version", {
          description: `Current version: ${version}`
        })
      }
      // If update is available, auto-download will handle it and native dialog will show
    } catch (error) {
      console.error('Failed to check for updates', error)
      toast.danger('Failed to check for updates', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsChecking(false)
    }
  }, [version])

  useEffect(() => {
    void onGetVersion()
  }, [onGetVersion])

  return {
    isChecking,
    onCheck,
    version
  }
}
