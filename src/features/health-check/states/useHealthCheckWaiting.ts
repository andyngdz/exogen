'use client'

import { BackendStepPhase } from '@/features/health-check/types'
import { useBackendHealth } from './useBackendHealth'
import { useBackendStepPhase } from './useBackendStepPhase'

/** Whether setup is running and the server has not answered yet. */
export const useHealthCheckWaiting = () => {
  const phase = useBackendStepPhase()
  const { isHealthy } = useBackendHealth()

  return phase === BackendStepPhase.RUNNING && !isHealthy
}
