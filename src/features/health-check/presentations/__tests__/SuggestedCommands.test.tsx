import { render, screen } from '@testing-library/react'
import type { BackendStatusCommand } from '@types'
import { describe, expect, it, vi } from 'vitest'
import { SuggestedCommands } from '../SuggestedCommands'

// Mock HeroUI components
vi.mock('@heroui/react', () => ({
  Divider: () => <hr data-testid="divider" />,
  Snippet: ({
    children,
    size,
    variant,
    hideSymbol,
    classNames
  }: {
    children: React.ReactNode
    size?: string
    variant?: string
    hideSymbol?: boolean
    classNames?: { base?: string }
  }) => (
    <div
      data-testid="snippet"
      data-size={size}
      data-variant={variant}
      data-hide-symbol={hideSymbol}
      className={classNames?.base}
    >
      {children}
    </div>
  )
}))

// Mock es-toolkit isEmpty
vi.mock('es-toolkit/compat', () => ({
  isEmpty: (arr: unknown[]) => !arr || arr.length === 0
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

  it('does not render when commands array is empty', () => {
    const { container } = render(<SuggestedCommands commands={[]} />)

    expect(container.firstChild).toBeNull()
  })

  it('renders divider when commands are present', () => {
    render(<SuggestedCommands commands={mockCommands} />)

    expect(screen.getByTestId('divider')).toBeInTheDocument()
  })

  it('renders "Suggested commands" title', () => {
    render(<SuggestedCommands commands={mockCommands} />)

    expect(screen.getByText('Suggested commands')).toBeInTheDocument()
  })

  it('renders correct number of commands', () => {
    render(<SuggestedCommands commands={mockCommands} />)

    const snippets = screen.getAllByTestId('snippet')
    expect(snippets).toHaveLength(2)
  })

  it('displays correct command labels', () => {
    render(<SuggestedCommands commands={mockCommands} />)

    expect(screen.getByText('Install uv')).toBeInTheDocument()
    expect(screen.getByText('Run setup')).toBeInTheDocument()
  })

  it('displays correct command text in snippets', () => {
    render(<SuggestedCommands commands={mockCommands} />)

    expect(
      screen.getByText('curl -LsSf https://astral.sh/uv/install.sh | sh')
    ).toBeInTheDocument()
    expect(screen.getByText('pnpm run setup')).toBeInTheDocument()
  })

  it('renders single command correctly', () => {
    const singleCommand = [mockCommands[0]]
    render(<SuggestedCommands commands={singleCommand} />)

    expect(screen.getByText('Install uv')).toBeInTheDocument()
    expect(
      screen.getByText('curl -LsSf https://astral.sh/uv/install.sh | sh')
    ).toBeInTheDocument()
    expect(screen.queryByText('Run setup')).not.toBeInTheDocument()
  })

  it('applies correct Snippet props', () => {
    render(<SuggestedCommands commands={mockCommands} />)

    const snippets = screen.getAllByTestId('snippet')
    snippets.forEach((snippet) => {
      expect(snippet).toHaveAttribute('data-size', 'sm')
      expect(snippet).toHaveAttribute('data-variant', 'flat')
      expect(snippet).toHaveAttribute('data-hide-symbol', 'true')
    })
  })

  it('applies correct styling classes', () => {
    render(<SuggestedCommands commands={mockCommands} />)

    const title = screen.getByText('Suggested commands')
    expect(title).toHaveClass('text-tiny')
    expect(title).toHaveClass('uppercase')
    expect(title).toHaveClass('tracking-wide')
    expect(title).toHaveClass('text-default-500')
  })

  it('applies correct label styling', () => {
    render(<SuggestedCommands commands={mockCommands} />)

    const label = screen.getByText('Install uv')
    expect(label).toHaveClass('text-tiny')
    expect(label).toHaveClass('font-semibold')
    expect(label).toHaveClass('text-default-500')
  })

  it('applies correct Snippet classNames', () => {
    render(<SuggestedCommands commands={mockCommands} />)

    const snippets = screen.getAllByTestId('snippet')
    snippets.forEach((snippet) => {
      expect(snippet).toHaveClass('max-w-full')
      expect(snippet).toHaveClass('bg-default-100')
      expect(snippet).toHaveClass('text-default-600')
    })
  })
})
