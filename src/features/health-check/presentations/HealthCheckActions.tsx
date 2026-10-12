'use client'

import { BACKEND_LOG_DRAWER_ACTIONS } from '@/features/backend-logs'
import { BACKEND_STEP_PHASE_COPY } from '@/features/health-check/constants/phase-copy'
import { useHealthCheckActions } from '@/features/health-check/states/useHealthCheckActions'
import { BackendStepPhase } from '@/features/health-check/types'
import { Button } from '@heroui/react'
import { ArrowRight, RotateCcw, SquareTerminal } from 'lucide-react'

/** The Backend step's footer: logs, then Retry while paused or failed, else Continue. */
export const HealthCheckActions = () => {
  const { phase, isHealthy, onRetry, onContinue } = useHealthCheckActions()
  const isRunning = phase === BackendStepPhase.RUNNING

  return (
    <>
      <Button variant="ghost" onPress={BACKEND_LOG_DRAWER_ACTIONS.open}>
        <SquareTerminal size={16} />
        View logs
      </Button>
      {!isRunning && (
        <Button variant="primary" onPress={onRetry}>
          <RotateCcw size={16} />
          {BACKEND_STEP_PHASE_COPY[phase].retryLabel}
        </Button>
      )}
      {isRunning && (
        <Button variant="primary" isDisabled={!isHealthy} onPress={onContinue}>
          Continue
          <ArrowRight size={16} />
        </Button>
      )}
    </>
  )
}
