'use client'

import { backendStepService } from '@/features/health-check/services/backend-step'
import { BackendStepPhase } from '@/features/health-check/types'
import { useBackendSetupStatusStore } from './useBackendSetupStatusStore'
import { useBackendStepPhase } from './useBackendStepPhase'

/** The commands a failed setup suggests; empty while running or offline. */
export const useBackendStepCommands = () => {
  const entries = useBackendSetupStatusStore((state) => state.entries)
  const phase = useBackendStepPhase()

  if (phase !== BackendStepPhase.FAILED) return []

  return backendStepService.toCommands(entries)
}
