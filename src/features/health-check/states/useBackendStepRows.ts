'use client'

import { backendStepService } from '@/features/health-check/services/backend-step'
import { useBackendHealth } from './useBackendHealth'
import { useBackendSetupStatusStore } from './useBackendSetupStatusStore'

/** The setup messages as rows, the newest one running until the backend answers. */
export const useBackendStepRows = () => {
  const entries = useBackendSetupStatusStore((state) => state.entries)
  const { isHealthy } = useBackendHealth()

  return backendStepService.toRows(entries, isHealthy)
}
