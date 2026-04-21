import { render, screen } from '@testing-library/react'
import { BackendStatusLevel } from '@types'
import { describe, expect, it, vi } from 'vitest'
import type { BackendSetupStatusEntry } from '../../states/useBackendSetupStatusStore'
import { BackendStatusList } from '../BackendStatusList'

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

describe('BackendStatusList', () => {
  const makeEntry = (
    overrides: Partial<BackendSetupStatusEntry> = {}
  ): BackendSetupStatusEntry => ({
    id: overrides.id ?? 'test-id',
    level: overrides.level ?? BackendStatusLevel.Info,
    message: overrides.message ?? 'backend ready',
    timestamp: overrides.timestamp ?? Date.now(),
    commands: overrides.commands
  })

  it('renders waiting state when no statuses', () => {
    render(<BackendStatusList statuses={[]} />)

    expect(
      screen.getByText('Waiting for backend status...')
    ).toBeInTheDocument()
  })

  it('renders entries as listbox items', () => {
    const statuses = [
      makeEntry({
        id: 'entry-1',
        message: 'cloning repo',
        timestamp: Date.now()
      }),
      makeEntry({
        id: 'entry-2',
        message: 'installing dependencies',
        timestamp: Date.now() + 1
      })
    ]

    render(<BackendStatusList statuses={statuses} />)

    expect(screen.getByText('cloning repo')).toBeInTheDocument()
    expect(screen.getByText('installing dependencies')).toBeInTheDocument()
  })

  it('shows command suggestions when present', () => {
    const statuses = [
      makeEntry({
        message: 'uv install failed',
        commands: [
          {
            label: 'Install uv',
            command: 'curl -LsSf https://astral.sh/uv/install.sh | sh'
          }
        ]
      })
    ]

    render(<BackendStatusList statuses={statuses} />)

    expect(screen.getByText('Suggested commands')).toBeInTheDocument()
    expect(screen.getByText('Install uv')).toBeInTheDocument()
  })

  describe('isLast prop behavior', () => {
    it('shows CircleDashed only on the last info entry (running)', () => {
      const statuses = [
        makeEntry({
          id: 'entry-1',
          message: 'first step',
          level: BackendStatusLevel.Info
        }),
        makeEntry({
          id: 'entry-2',
          message: 'second step',
          level: BackendStatusLevel.Info
        })
      ]

      render(<BackendStatusList statuses={statuses} />)

      const runningIcons = screen.getAllByTestId('circle-dashed')
      expect(runningIcons).toHaveLength(1)
    })

    it('shows CircleCheck on completed entries', () => {
      const statuses = [
        makeEntry({
          id: 'entry-1',
          message: 'first step',
          level: BackendStatusLevel.Info
        }),
        makeEntry({
          id: 'entry-2',
          message: 'second step',
          level: BackendStatusLevel.Info
        })
      ]

      render(<BackendStatusList statuses={statuses} />)

      const checkmarks = screen.getAllByTestId('circle-check')
      expect(checkmarks).toHaveLength(1)
    })

    it('shows no running indicator when last entry is error', () => {
      const statuses = [
        makeEntry({
          id: 'entry-1',
          message: 'first step',
          level: BackendStatusLevel.Info
        }),
        makeEntry({
          id: 'entry-2',
          message: 'error occurred',
          level: BackendStatusLevel.Error
        })
      ]

      render(<BackendStatusList statuses={statuses} />)

      expect(screen.queryByTestId('circle-dashed')).not.toBeInTheDocument()
    })
  })
})
