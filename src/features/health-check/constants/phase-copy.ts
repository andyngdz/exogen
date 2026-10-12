import { BackendStepPhase } from '@/features/health-check/types'

interface BackendStepPhaseCopy {
  title: string
  description: string
  retryLabel: string
}

// The offline copy avoids words like "failed" or "could not": it is a pause
// the user resolves by connecting, not a fault.
export const BACKEND_STEP_PHASE_COPY: Record<
  BackendStepPhase,
  BackendStepPhaseCopy
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
