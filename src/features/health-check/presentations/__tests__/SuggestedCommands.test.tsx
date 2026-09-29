import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { BackendStatusCommand } from '@types'
import { describe, expect, it, vi } from 'vitest'
import { SuggestedCommands } from '../SuggestedCommands'

const mockCopyToClipboard = vi.fn()

vi.mock('react-use', () => ({
  useCopyToClipboard: () => [{}, mockCopyToClipboard]
}))

describe('SuggestedCommands', () => {
  const mockCommands: BackendStatusCommand[] = [
    {
      label: 'Install uv',
      command: 'curl -LsSf https://astral.sh/uv/install.sh | sh'
    },
    {
      label: 'Run setup',
      command: 'pnpm run setup'
    }
  ]

  it('renders a separator and the "Suggested commands" title', () => {
    render(<SuggestedCommands commands={mockCommands} />)

    expect(screen.getByRole('separator')).toBeInTheDocument()
    expect(screen.getByText('Suggested commands')).toHaveClass(
      'text-xs',
      'uppercase',
      'text-muted'
    )
  })

  it('displays each command label and text', () => {
    render(<SuggestedCommands commands={mockCommands} />)

    expect(screen.getByText('Install uv')).toBeInTheDocument()
    expect(screen.getByText('Run setup')).toBeInTheDocument()
    expect(
      screen.getByText('curl -LsSf https://astral.sh/uv/install.sh | sh')
    ).toBeInTheDocument()
    expect(screen.getByText('pnpm run setup')).toBeInTheDocument()
  })

  it('renders one copy button per command', () => {
    render(<SuggestedCommands commands={mockCommands} />)

    expect(
      screen.getAllByRole('button', { name: 'Copy command' })
    ).toHaveLength(2)
  })

  it('renders single command correctly', () => {
    render(<SuggestedCommands commands={[mockCommands[0]]} />)

    expect(screen.getByText('Install uv')).toBeInTheDocument()
    expect(screen.queryByText('Run setup')).not.toBeInTheDocument()
  })

  it('copies the command text when its copy button is pressed', async () => {
    const user = userEvent.setup()
    render(<SuggestedCommands commands={mockCommands} />)

    const [, secondCopyButton] = screen.getAllByRole('button', {
      name: 'Copy command'
    })
    await user.click(secondCopyButton)

    expect(mockCopyToClipboard).toHaveBeenCalledWith('pnpm run setup')
  })
})
