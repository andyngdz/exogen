'use client'

import { OnboardingLayout } from '@/cores/shared/onboarding/presentations/OnboardingLayout'
import { OnboardingStep } from '@/cores/shared/onboarding/types'
import { BackendLogDrawer } from '@/features/backend-logs'
import { BACKEND_STEP_PHASE_COPY } from '@/features/health-check/constants/phase-copy'
import { useBackendSetupStatus } from '@/features/health-check/states/useBackendSetupStatus'
import { useBackendStepCommands } from '@/features/health-check/states/useBackendStepCommands'
import { useBackendStepPhase } from '@/features/health-check/states/useBackendStepPhase'
import { useHealthCheck } from '@/features/health-check/states/useHealthCheck'
import { useHealthCheckWaiting } from '@/features/health-check/states/useHealthCheckWaiting'
import { BackendStepPhase } from '@/features/health-check/types'
import { isEmpty } from 'es-toolkit/compat'
import { BackendStepCommands } from './BackendStepCommands'
import { BackendStepRows } from './BackendStepRows'
import { HealthCheckActions } from './HealthCheckActions'

/** Onboarding step 1, per frames 3d and 3e: the backend setup, its failure, and the offline pause. */
export const HealthCheck = () => {
  useBackendSetupStatus()
  useHealthCheck()
  const phase = useBackendStepPhase()
  const copy = BACKEND_STEP_PHASE_COPY[phase]
  const hasCommands = !isEmpty(useBackendStepCommands())
  const isWaiting = useHealthCheckWaiting()

  return (
    <OnboardingLayout
      step={OnboardingStep.BACKEND}
      isStepFailed={phase === BackendStepPhase.FAILED}
      title={copy.title}
      description={copy.description}
      footer={<HealthCheckActions />}
    >
      <BackendStepRows />
      {hasCommands && <BackendStepCommands />}
      {isWaiting && (
        <p className="text-sm text-muted">Waiting for the server to answer.</p>
      )}
      <BackendLogDrawer />
    </OnboardingLayout>
  )
}
