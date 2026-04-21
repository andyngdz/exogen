'use client'

import { addToast } from '@heroui/react'
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
        addToast({
          title: "You're already on the latest version",
          description: `Current version: ${version}`,
          color: 'success'
        })
      }
      // If update is available, auto-download will handle it and native dialog will show
    } catch (error) {
      console.error('Failed to check for updates', error)
      addToast({
        title: 'Failed to check for updates',
        description: error instanceof Error ? error.message : 'Unknown error',
        color: 'danger'
      })
    } finally {
      setIsChecking(false)
    }
  }, [version])

  useEffect(() => {
    onGetVersion()
  }, [onGetVersion])

  return {
    isChecking,
    onCheck,
    version
  }
}
