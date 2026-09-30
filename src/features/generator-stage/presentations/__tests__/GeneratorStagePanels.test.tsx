import { reconnectSocket } from '@/cores/sockets'
import { useAppShellStore } from '@/features/app-shell/states/useAppShellStore'
import { AppView } from '@/features/app-shell/types'
import {
  useGenerationErrorStore,
  useGeneratorSubmit,
  useLastRunStore
} from '@/features/generators/states'
import { SettingsTab, useSettingsStore } from '@/features/settings'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GeneratorStageFailed } from '../panels/GeneratorStageFailed'
import { GeneratorStageOffline } from '../panels/GeneratorStageOffline'

vi.mock('@/cores/sockets', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/cores/sockets')>()),
  reconnectSocket: vi.fn()
}))
vi.mock('@/features/generators/states', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/generators/states')>()),
  useGeneratorSubmit: vi.fn()
}))

const onSubmit = vi.fn()

describe('stage panels', () => {
  beforeEach(() => {
    onSubmit.mockClear()
    vi.mocked(reconnectSocket).mockClear()
    vi.mocked(useGeneratorSubmit).mockReturnValue({
      onSubmit,
      isDisabled: false,
      isGenerating: false,
      disabledReason: undefined
    })
    useLastRunStore.setState({ steps: undefined })
    useAppShellStore.setState({ activeView: AppView.GENERATE })
  })

  it('shows the failure with its step and offers the recovery actions', async () => {
    const user = userEvent.setup()
    useGenerationErrorStore.setState({
      failure: {
        message: 'CUDA out of memory. Tried to allocate 2.00 GiB',
        step: 12
      }
    })
    render(<GeneratorStageFailed />)

    expect(screen.getByText('Generation failed at step 12')).toBeInTheDocument()
    expect(
      screen.getByText('CUDA out of memory. Tried to allocate 2.00 GiB')
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Memory settings' }))
    expect(useAppShellStore.getState().activeView).toBe(AppView.SETTINGS)
    expect(useSettingsStore.getState().selectedTab).toBe(SettingsTab.MEMORY)

    await user.click(screen.getByRole('button', { name: 'Logs' }))
    expect(useAppShellStore.getState().activeView).toBe(AppView.LOGS)
  })

  it('counts the step against the steps the run was submitted with', () => {
    useLastRunStore.setState({ steps: 30 })
    useGenerationErrorStore.setState({
      failure: { message: 'CUDA out of memory', step: 12 }
    })
    render(<GeneratorStageFailed />)

    expect(
      screen.getByText('Generation failed at step 12 of 30')
    ).toBeInTheDocument()
  })

  it('titles a failure without a step event plainly', () => {
    useGenerationErrorStore.setState({ failure: { message: 'Bad request' } })
    render(<GeneratorStageFailed />)

    expect(screen.getByText('Generation failed')).toBeInTheDocument()
  })

  it('reconnects and opens logs from the offline panel', async () => {
    const user = userEvent.setup()
    render(<GeneratorStageOffline />)

    expect(screen.getByText('Backend stopped responding')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retry now' }))
    expect(reconnectSocket).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Open logs' }))
    expect(useAppShellStore.getState().activeView).toBe(AppView.LOGS)
  })
})
