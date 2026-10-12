'use client'

import { selectBackendStepPhase } from '@/features/health-check/services/backend-step'
import { useBackendSetupStatusStore } from './useBackendSetupStatusStore'

/** The backend setup phase, read from the newest setup message. */
export const useBackendStepPhase = () =>
  useBackendSetupStatusStore(selectBackendStepPhase)
