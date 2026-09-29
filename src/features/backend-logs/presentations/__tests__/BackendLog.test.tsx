import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BackendLog } from '../BackendLog'

// Mock BackendLogList
vi.mock('../BackendLogList', () => ({
  BackendLogList: () => <div data-testid="backend-log-list">Log List</div>
}))

const openDrawer = async () => {
  const user = userEvent.setup()
  render(<BackendLog />)
  await user.click(screen.getByRole('button', { name: 'Console' }))

  return user
}

describe('BackendLog', () => {
  it('renders console button', () => {
    render(<BackendLog />)

    expect(screen.getByRole('button', { name: 'Console' })).toBeInTheDocument()
  })

  it('does not render drawer when closed', () => {
    render(<BackendLog />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByTestId('backend-log-list')).not.toBeInTheDocument()
  })

  it('opens the drawer with the log list when console is pressed', async () => {
    await openDrawer()

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Backend Logs' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('backend-log-list')).toBeInTheDocument()
  })

  it('renders open folder button in drawer header', async () => {
    await openDrawer()

    expect(
      screen.getByRole('button', { name: 'Open backend folder' })
    ).toBeInTheDocument()
  })

  it('calls electronAPI.backend.openBackendFolder when folder button is clicked', async () => {
    const user = await openDrawer()

    await user.click(
      screen.getByRole('button', { name: 'Open backend folder' })
    )

    expect(
      globalThis.window.electronAPI.backend.openBackendFolder
    ).toHaveBeenCalledTimes(1)
  })
})
