'use client'

import { BackendLogDrawer } from '@/features/backend-logs'
import { useBackendStep } from '@/features/health-check/states/useBackendStep'
import { BackendStepPhase } from '@/features/health-check/types'
import { OnboardingLayout } from '@/features/setup-layout/presentations/OnboardingLayout'
import { OnboardingStep } from '@/features/setup-layout/types'
import { Button } from '@heroui/react'
import { isEmpty } from 'es-toolkit/compat'
import { ArrowRight, RotateCcw, SquareTerminal } from 'lucide-react'
import { BackendStepCommands } from './BackendStepCommands'
import { BackendStepRows } from './BackendStepRows'

// The offline copy avoids words like "failed" or "could not": it is a pause
// the user resolves by connecting, not a fault.
const PHASE_COPY: Record<
  BackendStepPhase,
  { title: string; description: string; retryLabel: string }
> = {
  [BackendStepPhase.RUNNING]: {
    title: 'Setting up the backend',
    description:
      'ExoGen installs its Python runtime once, then starts a local server. The first run takes a few minutes.',
    retryLabel: 'Retry setup'
  },
  [BackendStepPhase.FAILED]: {
    title: 'The backend could not start',
    description:
      'Setup stopped at the step marked in red. Run the suggested command in a terminal, then retry.',
    retryLabel: 'Retry setup'
  },
  [BackendStepPhase.OFFLINE]: {
    title: 'Connect to the internet to finish setup',
    description:
      'The first run downloads Python and the libraries ExoGen needs. Connect to the internet, then try again.',
    retryLabel: 'Try again'
  }
}

/** Onboarding step 1, per frames 3d and 3e: the backend setup, its failure, and the offline pause. */
export const HealthCheck = () => {
  const step = useBackendStep()

  const copy = PHASE_COPY[step.phase]
  const isRunning = step.phase === BackendStepPhase.RUNNING
  const isFailed = step.phase === BackendStepPhase.FAILED

  return (
    <OnboardingLayout
      step={OnboardingStep.BACKEND}
      isStepFailed={isFailed}
      title={copy.title}
      description={copy.description}
      footer={
        <>
          <Button variant="ghost" onPress={step.logsDrawer.open}>
            <SquareTerminal size={16} />
            View logs
          </Button>
          {!isRunning && (
            <Button variant="primary" onPress={step.onRetry}>
              <RotateCcw size={16} />
              {copy.retryLabel}
            </Button>
          )}
          {isRunning && (
            <Button
              variant="primary"
              isDisabled={!step.isHealthy}
              onPress={step.onContinue}
            >
              Continue
              <ArrowRight size={16} />
            </Button>
          )}
        </>
      }
    >
      <BackendStepRows rows={step.rows} />
      {isFailed && !isEmpty(step.commands) && (
        <BackendStepCommands commands={step.commands} />
      )}
      {isRunning && !step.isHealthy && (
        <p className="text-sm text-muted">Waiting for the server to answer.</p>
      )}
      <BackendLogDrawer
        isOpen={step.logsDrawer.isOpen}
        onOpenChange={step.logsDrawer.setOpen}
      />
    </OnboardingLayout>
  )
}
