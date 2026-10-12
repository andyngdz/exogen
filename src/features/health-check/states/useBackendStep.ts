'use client'

import { backendStepService } from '@/features/health-check/services/backend-step'
import { useOverlayState } from '@heroui/react'
import { useBackendSetupStatus } from './useBackendSetupStatus'
import { useBackendSetupStatusStore } from './useBackendSetupStatusStore'
import { useHealthCheck } from './useHealthCheck'

/** The Backend setup step: progress rows, failure, suggested commands, retry, logs. */
export const useBackendStep = () => {
  const { entries } = useBackendSetupStatus()
  const clearEntries = useBackendSetupStatusStore((state) => state.clear)
  const { isHealthy, onContinue } = useHealthCheck()
  const logsDrawer = useOverlayState()

  const isFailed = backendStepService.isFailed(entries)

  const onRetry = async () => {
    clearEntries()
    await globalThis.window.electronAPI.backend.retrySetup()
  }

  return {
    rows: backendStepService.toRows(entries, isHealthy),
    commands: backendStepService.toCommands(entries),
    isFailed,
    isHealthy,
    logsDrawer,
    onContinue,
    onRetry
  }
}
