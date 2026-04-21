import { render, screen } from '@testing-library/react'
import { BackendStatusLevel } from '@types'
import { describe, expect, it, vi } from 'vitest'
import type { BackendSetupStatusEntry } from '../../states/useBackendSetupStatusStore'
import { BackendStatusItem } from '../BackendStatusItem'

vi.mock('lucide-react', () => ({
  CircleDashed: ({
    className,
    size
  }: {
    className?: string
    size?: number
  }) => (
    <svg
      data-testid="circle-dashed"
      data-classname={className}
      data-size={size}
    >
      <title>Running</title>
    </svg>
  ),
  CircleCheck: ({ className, size }: { className?: string; size?: number }) => (
    <svg data-testid="circle-check" data-classname={className} data-size={size}>
      <title>Completed</title>
    </svg>
  )
}))

describe('BackendStatusItem', () => {
  const makeEntry = (
    overrides: Partial<BackendSetupStatusEntry> = {}
  ): BackendSetupStatusEntry => ({
    id: overrides.id ?? 'test-id',
    level: overrides.level ?? BackendStatusLevel.Info,
    message: overrides.message ?? 'backend ready',
    timestamp: overrides.timestamp ?? Date.now(),
    commands: overrides.commands
  })

  it('renders message and timestamp', () => {
    const entry = makeEntry({ message: 'cloning repo' })

    render(<BackendStatusItem status={entry} isLast={false} />)

    expect(screen.getByText('cloning repo')).toBeInTheDocument()
    expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument()
  })

  it('renders badge color based on level', () => {
    const entry = makeEntry({
      level: BackendStatusLevel.Error,
      message: 'uv failed'
    })

    render(<BackendStatusItem status={entry} isLast={false} />)

    const badge = screen.getByText('uv failed')
    expect(badge).toBeInTheDocument()
  })

  it('renders suggested commands when present', () => {
    const entry = makeEntry({
      commands: [
        {
          label: 'Install uv',
          command: 'curl -LsSf https://astral.sh/uv/install.sh | sh'
        }
      ]
    })

    render(<BackendStatusItem status={entry} isLast={false} />)

    expect(screen.getByText('Suggested commands')).toBeInTheDocument()
    expect(screen.getByText('Install uv')).toBeInTheDocument()
  })

  describe('status indicators', () => {
    it('shows CircleDashed when isLast is true and level is info (running)', () => {
      const entry = makeEntry({ level: BackendStatusLevel.Info })

      render(<BackendStatusItem status={entry} isLast={true} />)

      expect(screen.getByTestId('circle-dashed')).toBeInTheDocument()
      expect(screen.queryByTestId('circle-check')).not.toBeInTheDocument()
    })

    it('shows CircleCheck when isLast is false and level is info (completed)', () => {
      const entry = makeEntry({ level: BackendStatusLevel.Info })

      render(<BackendStatusItem status={entry} isLast={false} />)

      expect(screen.getByTestId('circle-check')).toBeInTheDocument()
      expect(screen.queryByTestId('circle-dashed')).not.toBeInTheDocument()
    })

    it('shows no indicator when level is error (isLast true)', () => {
      const entry = makeEntry({ level: BackendStatusLevel.Error })

      render(<BackendStatusItem status={entry} isLast={true} />)

      expect(screen.queryByTestId('circle-dashed')).not.toBeInTheDocument()
      expect(screen.queryByTestId('circle-check')).not.toBeInTheDocument()
    })

    it('shows no indicator when level is error (isLast false)', () => {
      const entry = makeEntry({ level: BackendStatusLevel.Error })

      render(<BackendStatusItem status={entry} isLast={false} />)

      expect(screen.queryByTestId('circle-dashed')).not.toBeInTheDocument()
      expect(screen.queryByTestId('circle-check')).not.toBeInTheDocument()
    })
  })
})
