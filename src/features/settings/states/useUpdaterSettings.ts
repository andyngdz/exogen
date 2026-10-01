'use client'

import { dateFormatter } from '@/services/date-formatter'
import { toast } from '@heroui/react'
import { useCallback, useEffect, useState } from 'react'
import {
  UPDATER_ACTIONS,
  useHasPendingUpdate,
  useUpdaterStore
} from './useUpdaterStore'

export const useUpdaterSettings = () => {
  const [version, setVersion] = useState('Development Build')
  const [isChecking, setIsChecking] = useState(false)
  const downloadedVersion = useUpdaterStore((state) => state.downloadedVersion)
  const hasPendingUpdate = useHasPendingUpdate()
  const lastCheckedAt = useUpdaterStore((state) => state.lastCheckedAt)

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

  const onInstall = useCallback(async () => {
    await globalThis.window.electronAPI.updater.installUpdate()
  }, [])

  return {
    downloadedVersion,
    hasPendingUpdate,
    isChecking,
    ...(lastCheckedAt && {
      lastCheckedLabel: `Last checked ${dateFormatter.relativeFromTimestamp(lastCheckedAt)}`
    }),
    onCheck,
    onInstall,
    onLater: UPDATER_ACTIONS.dismiss,
    version
  }
}
