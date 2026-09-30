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
    useAppShellStore.setState({
      activeView: AppView.GENERATE,
      isModelSearchOpen: false,
      isHistoryOpen: false,
      isLogsOpen: false
    })
  })

  it('marks Generate as the current view', () => {
    render(<AppRail />)

    expect(screen.getByRole('button', { name: 'Generate' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('opens model search, logs and settings', async () => {
    const user = userEvent.setup()
    render(<AppRail />)

    await user.click(screen.getByRole('button', { name: 'Models' }))
    await user.click(screen.getByRole('button', { name: 'Backend logs' }))
    await user.click(screen.getByRole('button', { name: 'Settings' }))

    expect(useAppShellStore.getState().isModelSearchOpen).toBe(true)
    expect(useAppShellStore.getState().isLogsOpen).toBe(true)
    expect(useAppShellStore.getState().activeView).toBe(AppView.SETTINGS)
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    await user.click(screen.getByRole('button', { name: 'Generate' }))

    expect(useAppShellStore.getState().activeView).toBe(AppView.GENERATE)
  })

  it('toggles the history column and shows it as active while open', async () => {
    const user = userEvent.setup()
    render(<AppRail />)
    const history = screen.getByRole('button', { name: 'History' })

    await user.click(history)
    expect(useAppShellStore.getState().isHistoryOpen).toBe(true)
    expect(history).toHaveAttribute('aria-pressed', 'true')

    await user.click(history)
    expect(useAppShellStore.getState().isHistoryOpen).toBe(false)
    expect(history).toHaveAttribute('aria-pressed', 'false')
  })
})
