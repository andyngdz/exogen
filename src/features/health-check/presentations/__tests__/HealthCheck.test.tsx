import { useBackendSetupStatusStore } from '@/features/health-check/states/useBackendSetupStatusStore'
import { BackendStatusLevel } from '@types'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HealthCheck } from '../HealthCheck'
import { useHealthCheck } from '../../states/useHealthCheck'

vi.mock('../../states/useHealthCheck', () => ({ useHealthCheck: vi.fn() }))
vi.mock('@/features/backend-logs', () => ({
  BackendLogDrawer: ({ isOpen }: { isOpen: boolean }) =>
    isOpen && <div>Log drawer</div>
}))
vi.mock('@/features/setup-layout/presentations/OnboardingLayout', () => ({
  OnboardingLayout: ({
    title,
    isStepFailed,
    children,
    footer
  }: {
    title: string
    isStepFailed?: boolean
    children: ReactNode
    footer: ReactNode
  }) => (
    <div>
      <h1>{title}</h1>
      <span>{isStepFailed ? 'step failed' : 'step ok'}</span>
      {children}
      {footer}
    </div>
  )
}))

const onContinue = vi.fn()

const renderStep = (isHealthy = false) => {
  vi.mocked(useHealthCheck).mockReturnValue({ isHealthy, onContinue })
  return render(<HealthCheck />)
}

const addEntry = (level: BackendStatusLevel, message: string, commands = []) =>
  useBackendSetupStatusStore.getState().addEntry({ level, message, commands })

describe('HealthCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useBackendSetupStatusStore.setState({ entries: [] })
  })

  it('shows setup progress with the newest step running and Continue disabled', () => {
    addEntry(BackendStatusLevel.Info, 'Python 3.11.9 detected.')
    addEntry(BackendStatusLevel.Info, 'Starting ExoGen Backend on port 8000…')
    renderStep()

    expect(screen.getByText('Setting up the backend')).toBeInTheDocument()
    expect(screen.getByLabelText('Done')).toBeInTheDocument()
    expect(screen.getByLabelText('Running')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  it('continues once the backend answers', async () => {
    const user = userEvent.setup()
    addEntry(BackendStatusLevel.Info, 'Backend is up to date.')
    renderStep(true)

    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(onContinue).toHaveBeenCalled()
  })

  it('shows the failure, the suggested command and retries the setup', async () => {
    const user = userEvent.setup()
    addEntry(BackendStatusLevel.Info, 'Python 3.11.9 detected.')
    useBackendSetupStatusStore.getState().addEntry({
      level: BackendStatusLevel.Error,
      message: 'Backend setup failed: uv installer exited with code 1',
      commands: [
        {
          label: 'Install uv (macOS and Linux)',
          command: 'curl -LsSf https://astral.sh/uv/install.sh | sh'
        }
      ]
    })
    renderStep()

    expect(screen.getByText('The backend could not start')).toBeInTheDocument()
    expect(screen.getByText('step failed')).toBeInTheDocument()
    expect(screen.getByLabelText('Failed')).toBeInTheDocument()
    expect(
      screen.getByText('curl -LsSf https://astral.sh/uv/install.sh | sh')
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retry setup' }))

    expect(globalThis.window.electronAPI.backend.retrySetup).toHaveBeenCalled()
    expect(useBackendSetupStatusStore.getState().entries).toEqual([])
  })

  it('opens the logs', async () => {
    const user = userEvent.setup()
    renderStep()

    await user.click(screen.getByRole('button', { name: 'View logs' }))

    expect(screen.getByText('Log drawer')).toBeInTheDocument()
  })
})
