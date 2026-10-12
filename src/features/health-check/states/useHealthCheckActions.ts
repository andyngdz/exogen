'use client'

import { useConfig } from '@/cores/hooks'
import { useRouter } from 'next/navigation'
import { useBackendHealth } from './useBackendHealth'
import { BACKEND_SETUP_STATUS_ACTIONS } from './useBackendSetupStatusStore'
import { useBackendStepPhase } from './useBackendStepPhase'

/** The Backend step's footer: retry while paused or failed, else Continue once healthy. */
export const useHealthCheckActions = () => {
  const router = useRouter()
  const phase = useBackendStepPhase()
  const { isHealthy } = useBackendHealth()
  const { isHasDevice } = useConfig()

  const onRetry = async () => {
    BACKEND_SETUP_STATUS_ACTIONS.clear()
    await globalThis.window.electronAPI.backend.retrySetup()
  }

  const onContinue = () => {
    router.push(isHasDevice ? '/editor' : '/gpu-detection')
  }

  return { phase, isHealthy, onRetry, onContinue }
}
