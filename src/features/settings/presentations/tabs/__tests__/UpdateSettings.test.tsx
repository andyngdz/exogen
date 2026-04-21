import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UpdateSettings } from '../UpdateSettings'

// Helper to create a delayed promise
const createDelayedPromise = <T,>(value: T, ms: number): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms))

// Mock HeroUI components
vi.mock('@heroui/react', () => ({
  Button: ({
    children,
    onPress,
    isLoading,
    color
  }: {
    children: React.ReactNode
    onPress?: () => void
    isLoading?: boolean
    color?: string
  }) => (
    <button
      onClick={onPress}
      disabled={isLoading}
      data-loading={isLoading}
      data-color={color}
    >
      {children}
    </button>
  ),
  addToast: vi.fn(),
  Divider: () => <hr />
}))

describe('UpdateSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(window.electronAPI.updater.checkForUpdates).mockResolvedValue({
      updateAvailable: false
    })
  })

  it('renders the component with title and description', async () => {
    vi.mocked(window.electronAPI.app.getVersion).mockResolvedValue('1.2.3')

    render(<UpdateSettings />)

    expect(screen.getByText('Updates')).toBeInTheDocument()
    expect(screen.getByText(/Current version:/)).toBeInTheDocument()

    // Wait for async effect to complete
    await waitFor(() => {
      expect(screen.getByText(/Current version: 1.2.3/i)).toBeInTheDocument()
    })
  })

  it('renders the current version once resolved', async () => {
    vi.mocked(window.electronAPI.app.getVersion).mockResolvedValue('1.2.3')

    render(<UpdateSettings />)

    expect(
      await screen.findByText(/Current version: 1.2.3/i)
    ).toBeInTheDocument()
  })

  it('shows "Development Build" as default version before API resolves', async () => {
    vi.mocked(window.electronAPI.app.getVersion).mockResolvedValue('1.2.3')

    render(<UpdateSettings />)

    expect(
      screen.getByText(/Current version: Development Build/i)
    ).toBeInTheDocument()

    // Wait for async effect to complete
    await waitFor(() => {
      expect(screen.getByText(/Current version: 1.2.3/i)).toBeInTheDocument()
    })
  })

  it('renders check for updates button with correct text', async () => {
    vi.mocked(window.electronAPI.app.getVersion).mockResolvedValue('1.2.3')

    render(<UpdateSettings />)

    const button = screen.getByRole('button', {
      name: /Check for updates/i
    })

    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('data-color', 'primary')

    // Wait for async effect to complete
    await waitFor(() => {
      expect(screen.getByText(/Current version: 1.2.3/i)).toBeInTheDocument()
    })
  })

  it('requests an update check when the button is pressed', async () => {
    vi.mocked(window.electronAPI.app.getVersion).mockResolvedValue('1.2.3')

    render(<UpdateSettings />)

    const button = screen.getByRole('button', {
      name: /Check for updates/i
    })

    await act(async () => {
      fireEvent.click(button)
    })

    await waitFor(() =>
      expect(window.electronAPI.updater.checkForUpdates).toHaveBeenCalled()
    )
  })

  it('shows loading state while checking for updates', async () => {
    vi.mocked(window.electronAPI.app.getVersion).mockResolvedValue('1.2.3')
    vi.mocked(window.electronAPI.updater.checkForUpdates).mockImplementation(
      () => createDelayedPromise({ updateAvailable: false }, 100)
    )

    render(<UpdateSettings />)

    const button = screen.getByRole('button')

    await act(async () => {
      fireEvent.click(button)
    })

    // Button should show loading state
    await waitFor(() => {
      expect(button).toHaveAttribute('data-loading', 'true')
      expect(button).toHaveTextContent('Checking…')
      expect(button).toBeDisabled()
    })
  })

  it('returns to normal state after check completes', async () => {
    vi.mocked(window.electronAPI.app.getVersion).mockResolvedValue('1.2.3')
    vi.mocked(window.electronAPI.updater.checkForUpdates).mockImplementation(
      () => createDelayedPromise({ updateAvailable: false }, 50)
    )

    render(<UpdateSettings />)

    const button = screen.getByRole('button')

    await act(async () => {
      fireEvent.click(button)
    })

    // Wait for loading state
    await waitFor(() => expect(button).toHaveAttribute('data-loading', 'true'))

    // Wait for loading to finish
    await waitFor(() => {
      expect(button).toHaveAttribute('data-loading', 'false')
      expect(button).toHaveTextContent('Check for updates')
      expect(button).not.toBeDisabled()
    })
  })

  it('handles update check errors gracefully', async () => {
    // Suppress console.error from the hook's error handling
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    vi.mocked(window.electronAPI.app.getVersion).mockResolvedValue('1.2.3')
    vi.mocked(window.electronAPI.updater.checkForUpdates).mockRejectedValue(
      new Error('Network error')
    )

    render(<UpdateSettings />)

    const button = screen.getByRole('button')

    await act(async () => {
      fireEvent.click(button)
    })

    // Button should return to normal state after error
    await waitFor(() => {
      expect(button).toHaveAttribute('data-loading', 'false')
      expect(button).toHaveTextContent('Check for updates')
    })

    consoleErrorSpy.mockRestore()
  })

  it('can be clicked multiple times', async () => {
    vi.mocked(window.electronAPI.app.getVersion).mockResolvedValue('1.2.3')
    vi.mocked(window.electronAPI.updater.checkForUpdates).mockResolvedValue({
      updateAvailable: false
    })

    render(<UpdateSettings />)

    const button = screen.getByRole('button')

    // First click
    await act(async () => {
      fireEvent.click(button)
    })

    await waitFor(() =>
      expect(window.electronAPI.updater.checkForUpdates).toHaveBeenCalledTimes(
        1
      )
    )

    // Wait for loading to finish
    await waitFor(() => expect(button).not.toBeDisabled())

    // Second click
    await act(async () => {
      fireEvent.click(button)
    })

    await waitFor(() =>
      expect(window.electronAPI.updater.checkForUpdates).toHaveBeenCalledTimes(
        2
      )
    )
  })
})
