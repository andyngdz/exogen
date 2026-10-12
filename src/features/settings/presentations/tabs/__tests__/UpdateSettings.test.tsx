import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useUpdaterStore } from '@/features/settings/states/useUpdaterStore'
import { UpdateSettings } from '../UpdateSettings'

// Helper to create a delayed promise
const createDelayedPromise = <T,>(value: T, ms: number): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms))

vi.mock('@heroui/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@heroui/react')>()),
  toast: { success: vi.fn(), danger: vi.fn(), warning: vi.fn() }
}))

describe('UpdateSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useUpdaterStore.setState(useUpdaterStore.getInitialState(), true)
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
    expect(button).toHaveClass('button--tertiary')

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
      expect(button).toHaveAttribute('data-pending', 'true')
      expect(button).toHaveTextContent('Checking…')
      expect(button).toHaveAttribute('aria-disabled', 'true')
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
    await waitFor(() => expect(button).toHaveAttribute('data-pending', 'true'))

    // Wait for loading to finish
    await waitFor(() => {
      expect(button).not.toHaveAttribute('data-pending')
      expect(button).toHaveTextContent('Check for updates')
      expect(button).not.toHaveAttribute('aria-disabled')
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
      expect(button).not.toHaveAttribute('data-pending')
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
    await waitFor(() => expect(button).not.toHaveAttribute('aria-disabled'))

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

  describe('downloaded update', () => {
    beforeEach(() => {
      useUpdaterStore.setState({ downloadedVersion: '1.20.0' })
    })

    it('shows the ready card with the downloaded version', async () => {
      render(<UpdateSettings />)

      expect(
        screen.getByText('ExoGen 1.20.0 is ready to install')
      ).toBeInTheDocument()
      await waitFor(() =>
        expect(screen.getByText(/Current version: 0.0.0/)).toBeInTheDocument()
      )
    })

    it('installs when Install and restart is pressed', async () => {
      render(<UpdateSettings />)

      await act(async () => {
        fireEvent.click(
          screen.getByRole('button', { name: /Install and restart/ })
        )
      })

      expect(window.electronAPI.updater.installUpdate).toHaveBeenCalledTimes(1)
    })

    it('hides the card after Later', async () => {
      render(<UpdateSettings />)

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Later' }))
      })

      expect(
        screen.queryByText('ExoGen 1.20.0 is ready to install')
      ).not.toBeInTheDocument()
    })
  })

  it('shows when the last check ran', async () => {
    const lastCheckedAt = new Date(2026, 9, 2, 21, 58).getTime()
    useUpdaterStore.setState({ lastCheckedAt })

    render(<UpdateSettings />)

    expect(screen.getByText('Last checked at 21:58')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByText(/Current version: 0.0.0/)).toBeInTheDocument()
    )
  })

  it('shows no ready card without a downloaded update', async () => {
    render(<UpdateSettings />)

    expect(screen.queryByText(/ready to install/)).not.toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByText(/Current version: 0.0.0/)).toBeInTheDocument()
    )
  })
})
