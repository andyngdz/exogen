import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Providers } from '../providers'

// Mock the DownloadWatcher component
vi.mock('@/features/download-watcher', () => ({
  DownloadWatcher: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="download-watcher">{children}</div>
  )
}))

// Mock the BackendLogCollector component to prevent act() warnings
// from its internal useEffect that updates Zustand state
vi.mock('@/features/backend-logs', () => ({
  BackendLogCollector: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="backend-log-collector">{children}</div>
  )
}))

vi.mock('@tanstack/react-query', () => ({
  QueryClient: vi.fn().mockReturnThis(),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="query-client-provider">{children}</div>
  )
}))

vi.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: (props: { initialIsOpen: boolean }) => (
    <div
      data-testid="react-query-devtools"
      data-initial-open={props.initialIsOpen}
    />
  )
}))

describe('Providers', () => {
  it('renders children within provider structure', () => {
    render(
      <Providers>
        <div data-testid="test-children">Test Content</div>
      </Providers>
    )

    expect(screen.getByTestId('query-client-provider')).toBeInTheDocument()
    expect(screen.getByTestId('download-watcher')).toBeInTheDocument()
    expect(screen.getByTestId('react-query-devtools')).toBeInTheDocument()
    expect(screen.getByTestId('test-children')).toBeInTheDocument()
  })

  it('does not wrap the tree in a HeroUI provider element', () => {
    const { container } = render(
      <Providers>
        <div>Test</div>
      </Providers>
    )

    expect(container.firstElementChild).toBe(
      screen.getByTestId('query-client-provider')
    )
  })

  it('includes DownloadWatcher inside BackendLogCollector', () => {
    render(
      <Providers>
        <div data-testid="test-child">Test</div>
      </Providers>
    )

    const collector = screen.getByTestId('backend-log-collector')
    const downloadWatcher = screen.getByTestId('download-watcher')
    expect(collector).toContainElement(downloadWatcher)
    expect(downloadWatcher).toContainElement(screen.getByTestId('test-child'))
  })

  it('includes ReactQueryDevtools with correct props', () => {
    render(
      <Providers>
        <div>Test</div>
      </Providers>
    )

    expect(screen.getByTestId('react-query-devtools')).toHaveAttribute(
      'data-initial-open',
      'false'
    )
  })
})
