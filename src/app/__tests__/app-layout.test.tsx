import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppLayout } from '../app-layout'

vi.mock('@/features/app-footer', () => ({
  AppFooter: () => <div data-testid="app-footer" />
}))

vi.mock('@/cores/presentations', () => ({
  FullScreenLoader: ({ message }: { message: string }) => (
    <div data-testid="full-screen-loader">{message}</div>
  )
}))

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/')
}))

const mockUseBackendInitStore = vi.fn(() => true)

vi.mock('@/cores/backend-initialization', () => ({
  initializeBackend: vi.fn(),
  useBackendInitStore: (
    selector: (state: { isInitialized: boolean }) => boolean
  ) => selector({ isInitialized: mockUseBackendInitStore() })
}))

describe('AppLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseBackendInitStore.mockReturnValue(true)
  })

  it('renders children and footer when initialized', () => {
    render(
      <AppLayout>
        <div data-testid="test-content">Test Content</div>
      </AppLayout>
    )

    expect(screen.getByTestId('test-content')).toBeInTheDocument()
    expect(screen.getByTestId('app-footer')).toBeInTheDocument()
  })

  it('calls initializeBackend on mount', async () => {
    const { initializeBackend } = await import('@/cores/backend-initialization')

    render(
      <AppLayout>
        <div>Test</div>
      </AppLayout>
    )

    expect(initializeBackend).toHaveBeenCalledTimes(1)
  })

  it('renders children on home page even when not initialized', async () => {
    const { usePathname } = await import('next/navigation')
    vi.mocked(usePathname).mockReturnValue('/')
    mockUseBackendInitStore.mockReturnValue(false)

    render(
      <AppLayout>
        <div data-testid="home-content">Home Content</div>
      </AppLayout>
    )

    expect(screen.getByTestId('home-content')).toBeInTheDocument()
  })

  it('shows loader on other pages when not initialized', async () => {
    const { usePathname } = await import('next/navigation')
    vi.mocked(usePathname).mockReturnValue('/editor')
    mockUseBackendInitStore.mockReturnValue(false)

    render(
      <AppLayout>
        <div data-testid="editor-content">Editor Content</div>
      </AppLayout>
    )

    expect(screen.queryByTestId('editor-content')).not.toBeInTheDocument()
    expect(screen.getByTestId('full-screen-loader')).toBeInTheDocument()
    expect(screen.getByText('Initializing backend...')).toBeInTheDocument()
    expect(screen.queryByTestId('app-footer')).not.toBeInTheDocument()
  })

  it('keeps the footer on onboarding pages', async () => {
    const { usePathname } = await import('next/navigation')
    vi.mocked(usePathname).mockReturnValue('/gpu-detection')
    mockUseBackendInitStore.mockReturnValue(true)

    render(
      <AppLayout>
        <div data-testid="onboarding-content">Onboarding</div>
      </AppLayout>
    )

    expect(screen.getByTestId('app-footer')).toBeInTheDocument()
  })

  it('hides the footer on the editor, whose path ends with a slash', async () => {
    const { usePathname } = await import('next/navigation')
    vi.mocked(usePathname).mockReturnValue('/editor/')
    mockUseBackendInitStore.mockReturnValue(true)

    render(
      <AppLayout>
        <div data-testid="editor-content">Editor Content</div>
      </AppLayout>
    )

    expect(screen.queryByTestId('app-footer')).not.toBeInTheDocument()
  })

  it('renders children on other pages when initialized', async () => {
    const { usePathname } = await import('next/navigation')
    vi.mocked(usePathname).mockReturnValue('/editor')
    mockUseBackendInitStore.mockReturnValue(true)

    render(
      <AppLayout>
        <div data-testid="editor-content">Editor Content</div>
      </AppLayout>
    )

    expect(screen.getByTestId('editor-content')).toBeInTheDocument()
  })
})
