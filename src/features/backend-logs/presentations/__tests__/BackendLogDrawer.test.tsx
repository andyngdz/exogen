import { render, screen } from '@testing-library/react'
import { act } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BACKEND_LOG_DRAWER_ACTIONS } from '../../states/useBackendLogDrawerStore'
import { BackendLogDrawer } from '../BackendLogDrawer'

vi.mock('../BackendLogList', () => ({
  BackendLogList: () => <div data-testid="backend-log-list" />
}))

vi.mock('@/features/backend-logs/states', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/backend-logs/states')>()),
  useBackendFolder: () => ({ onOpenBackendFolder: vi.fn() })
}))

describe('BackendLogDrawer', () => {
  afterEach(() => {
    act(() => BACKEND_LOG_DRAWER_ACTIONS.setOpen(false))
  })

  it('renders the logs once opened', () => {
    render(<BackendLogDrawer />)

    act(() => BACKEND_LOG_DRAWER_ACTIONS.open())

    expect(screen.getByText('Backend Logs')).toBeInTheDocument()
    expect(screen.getByTestId('backend-log-list')).toBeInTheDocument()
  })

  it('renders nothing when closed', () => {
    render(<BackendLogDrawer />)

    expect(screen.queryByText('Backend Logs')).not.toBeInTheDocument()
  })
})
