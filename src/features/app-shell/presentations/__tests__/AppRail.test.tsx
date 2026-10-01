import { useAppShellStore } from '@/features/app-shell/states/useAppShellStore'
import { AppView } from '@/features/app-shell/types'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRail } from '../AppRail'

vi.mock('next/image', async () => {
  const { mockNextImage } = await import('@/cores/test-utils')
  return mockNextImage()
})

describe('AppRail', () => {
  beforeEach(() => {
    useAppShellStore.setState({ activeView: AppView.GENERATE })
  })

  it('marks Generate as the current view', () => {
    render(<AppRail />)

    expect(screen.getByRole('button', { name: 'Generate' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('opens the Models, Logs and Settings views', async () => {
    const user = userEvent.setup()
    render(<AppRail />)

    await user.click(screen.getByRole('button', { name: 'Models' }))
    expect(useAppShellStore.getState().activeView).toBe(AppView.MODELS)

    await user.click(screen.getByRole('button', { name: 'Backend logs' }))
    expect(useAppShellStore.getState().activeView).toBe(AppView.LOGS)

    await user.click(screen.getByRole('button', { name: 'Settings' }))
    expect(useAppShellStore.getState().activeView).toBe(AppView.SETTINGS)
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    await user.click(screen.getByRole('button', { name: 'Generate' }))

    expect(useAppShellStore.getState().activeView).toBe(AppView.GENERATE)
  })

  it('opens History as a view and marks it current', async () => {
    const user = userEvent.setup()
    render(<AppRail />)
    const history = screen.getByRole('button', { name: 'History' })

    await user.click(history)

    expect(useAppShellStore.getState().activeView).toBe(AppView.HISTORY)
    expect(history).toHaveAttribute('aria-pressed', 'true')
  })
})
