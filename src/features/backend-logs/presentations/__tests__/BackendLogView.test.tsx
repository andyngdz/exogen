import { useBackendLogStore } from '@/features/backend-logs/states/useBackendLogStore'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { BackendLogView } from '../BackendLogView'

describe('BackendLogView', () => {
  beforeEach(() => {
    useBackendLogStore.setState({
      isStreaming: true,
      logs: [
        { level: 'info', message: 'Model ready', timestamp: 1 },
        { level: 'error', message: 'CUDA out of memory', timestamp: 2 }
      ]
    })
  })

  it('shows every line, then only errors when filtered', async () => {
    const user = userEvent.setup()
    render(<BackendLogView />)

    const lines = screen.getByRole('log', { name: 'Backend log lines' })
    expect(screen.getByText('Streaming')).toBeInTheDocument()
    expect(within(lines).getByText('Model ready')).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Errors' }))

    expect(within(lines).queryByText('Model ready')).not.toBeInTheDocument()
    expect(within(lines).getByText('CUDA out of memory')).toBeInTheDocument()
  })

  it('says when a filter has no lines', async () => {
    const user = userEvent.setup()
    render(<BackendLogView />)

    await user.click(screen.getByRole('radio', { name: 'Warnings' }))

    expect(
      screen.getByText('No log lines for this filter yet.')
    ).toBeInTheDocument()
  })

  it('keeps following new lines once the store is at its cap', () => {
    render(<BackendLogView />)
    const lines = screen.getByRole('log', { name: 'Backend log lines' })
    Object.defineProperty(lines, 'scrollHeight', {
      configurable: true,
      value: 900
    })
    lines.scrollTop = 0

    // A capped store drops the oldest line as it adds one: same count.
    act(() => {
      useBackendLogStore.setState({
        logs: [
          { level: 'error', message: 'CUDA out of memory', timestamp: 2 },
          {
            level: 'info',
            message: 'Retrying with a smaller tile',
            timestamp: 3
          }
        ]
      })
    })

    expect(lines.scrollTop).toBe(900)
  })
})
