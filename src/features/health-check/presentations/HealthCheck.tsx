'use client'

import { BackendLogDrawer } from '@/features/backend-logs'
import { useBackendStep } from '@/features/health-check/states/useBackendStep'
import { OnboardingLayout } from '@/features/setup-layout/presentations/OnboardingLayout'
import { OnboardingStep } from '@/features/setup-layout/types'
import { Button } from '@heroui/react'
import { isEmpty } from 'es-toolkit/compat'
import { ArrowRight, RotateCcw, SquareTerminal } from 'lucide-react'
import { BackendStepCommands } from './BackendStepCommands'
import { BackendStepRows } from './BackendStepRows'

/** Onboarding step 1, per frames 3d and 3e: the backend setup and its failure. */
export const HealthCheck = () => {
  const step = useBackendStep()

  const title = step.isFailed
    ? 'The backend could not start'
    : 'Setting up the backend'
  const description = step.isFailed
    ? 'Setup stopped at the step marked in red. Run the suggested command in a terminal, then retry.'
    : 'ExoGen installs its Python runtime once, then starts a local server. The first run takes a few minutes.'

  return (
    <OnboardingLayout
      step={OnboardingStep.BACKEND}
      isStepFailed={step.isFailed}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="ghost" onPress={step.logsDrawer.open}>
            <SquareTerminal size={16} />
            View logs
          </Button>
          {step.isFailed && (
            <Button variant="primary" onPress={step.onRetry}>
              <RotateCcw size={16} />
              Retry setup
            </Button>
          )}
          {!step.isFailed && (
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
      {step.isFailed && !isEmpty(step.commands) && (
        <BackendStepCommands commands={step.commands} />
      )}
      {!step.isFailed && !step.isHealthy && (
        <p className="text-sm text-muted">Waiting for the server to answer.</p>
      )}
      <BackendLogDrawer
        isOpen={step.logsDrawer.isOpen}
        onOpenChange={step.logsDrawer.setOpen}
      />
    </OnboardingLayout>
  )
}
