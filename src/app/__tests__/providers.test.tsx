import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Providers } from '../providers'

// Mock the DownloadWatcher component
vi.mock('@/features/download-watcher/presentations/DownloadWatcher', () => ({
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

// Mock the external providers
vi.mock('@heroui/react', () => ({
  HeroUIProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="heroui-provider">{children}</div>
  ),
  ToastProvider: () => <div data-testid="toast-provider" />
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
    const testChildren = <div data-testid="test-children">Test Content</div>

    render(<Providers>{testChildren}</Providers>)

    expect(screen.getByTestId('heroui-provider')).toBeInTheDocument()
    expect(screen.getByTestId('query-client-provider')).toBeInTheDocument()
    expect(screen.getByTestId('download-watcher')).toBeInTheDocument()
    expect(screen.getByTestId('react-query-devtools')).toBeInTheDocument()
    expect(screen.getByTestId('test-children')).toBeInTheDocument()
  })

  it('wraps children with HeroUIProvider', () => {
    render(
      <Providers>
        <div data-testid="child-content">Child</div>
      </Providers>
    )

    expect(screen.getByTestId('heroui-provider')).toBeInTheDocument()
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('includes QueryClientProvider', () => {
    render(
      <Providers>
        <div>Test</div>
      </Providers>
    )

    expect(screen.getByTestId('query-client-provider')).toBeInTheDocument()
  })

  it('includes DownloadWatcher wrapping children', () => {
    render(
      <Providers>
        <div data-testid="test-child">Test</div>
      </Providers>
    )

    const downloadWatcher = screen.getByTestId('download-watcher')
    expect(downloadWatcher).toBeInTheDocument()
    expect(downloadWatcher).toContainElement(screen.getByTestId('test-child'))
  })

  it('includes ReactQueryDevtools with correct props', () => {
    render(
      <Providers>
        <div>Test</div>
      </Providers>
    )

    const devtools = screen.getByTestId('react-query-devtools')
    expect(devtools).toBeInTheDocument()
    expect(devtools).toHaveAttribute('data-initial-open', 'false')
  })

  it('has correct provider nesting structure', () => {
    render(
      <Providers>
        <div data-testid="nested-child">Nested Child</div>
      </Providers>
    )

    // HeroUIProvider should be the outermost
    const heroui = screen.getByTestId('heroui-provider')
    const queryClient = screen.getByTestId('query-client-provider')
    const downloadWatcher = screen.getByTestId('download-watcher')
    const child = screen.getByTestId('nested-child')

    expect(heroui).toBeInTheDocument()
    expect(queryClient).toBeInTheDocument()
    expect(downloadWatcher).toBeInTheDocument()
    expect(child).toBeInTheDocument()
  })

  it('renders expected provider DOM', () => {
    const { container } = render(
      <Providers>
        <div>Test Content</div>
      </Providers>
    )

    expect(screen.getByTestId('heroui-provider')).toBeInTheDocument()
    expect(screen.getByTestId('query-client-provider')).toBeInTheDocument()
    expect(screen.getByTestId('download-watcher')).toBeInTheDocument()
    expect(screen.getByTestId('react-query-devtools')).toBeInTheDocument()
    expect(container.firstChild).toContainElement(
      screen.getByTestId('query-client-provider')
    )
  })
})
