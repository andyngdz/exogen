'use client'

import { dateFormatter } from '@/services/date-formatter'
import { toast } from '@heroui/react'
import { useState } from 'react'
import { useAppVersion } from './useAppVersion'
import { useUpdaterStore } from './useUpdaterStore'

/** The Check for updates row: when it last checked, and a manual check. */
export const useUpdateCheck = () => {
  const [isChecking, setIsChecking] = useState(false)
  const version = useAppVersion()
  const lastCheckedAt = useUpdaterStore((state) => state.lastCheckedAt)

  const onCheck = async () => {
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
  }

  return {
    isChecking,
    ...(lastCheckedAt && {
      lastCheckedLabel: `Last checked at ${dateFormatter.timeFromTimestamp(lastCheckedAt)}`
    }),
    onCheck: () => void onCheck()
  }
}
