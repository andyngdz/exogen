import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BackendLogDrawer } from '../BackendLogDrawer'

vi.mock('../BackendLogList', () => ({
  BackendLogList: () => <div data-testid="backend-log-list" />
}))

vi.mock('@/features/backend-logs/states', () => ({
  useBackendFolder: () => ({ onOpenBackendFolder: vi.fn() })
}))

describe('BackendLogDrawer', () => {
  it('renders the logs when open', () => {
    render(<BackendLogDrawer isOpen onOpenChange={vi.fn()} />)

    expect(screen.getByText('Backend Logs')).toBeInTheDocument()
    expect(screen.getByTestId('backend-log-list')).toBeInTheDocument()
  })

  it('renders nothing when closed', () => {
    render(<BackendLogDrawer isOpen={false} onOpenChange={vi.fn()} />)

    expect(screen.queryByText('Backend Logs')).not.toBeInTheDocument()
  })
})
