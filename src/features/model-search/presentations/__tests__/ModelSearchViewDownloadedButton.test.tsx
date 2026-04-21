import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'

import { ButtonProps } from '@heroui/react'
import { ModelSearchViewDownloadedButton } from '../ModelSearchViewDownloadedButton'
import { SettingsTab } from '@/features/settings/states/useSettingsStore'

// Mock openModal function
const mockOpenModal = vi.fn()

// Mock the settings store, keeping SettingsTab from the real module
vi.mock('@/features/settings/states/useSettingsStore', async () => {
  const actual = await vi.importActual<
    typeof import('@/features/settings/states/useSettingsStore')
  >('@/features/settings/states/useSettingsStore')
  return {
    ...actual,
    useSettingsStore: () => ({
      openModal: mockOpenModal
    })
  }
})

// Mock the Button from @heroui/react to a simple button for testing
vi.mock('@heroui/react', () => ({
  Button: ({ children, variant, className, onPress }: ButtonProps) => (
    <button
      data-testid="button"
      data-variant={variant}
      className={className}
      onClick={() => onPress?.({} as never)}
    >
      {children}
    </button>
  )
}))

describe('ModelSearchViewDownloadedButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders a bordered button with correct text', () => {
      // Arrange & Act
      render(<ModelSearchViewDownloadedButton />)

      // Assert
      const button = screen.getByTestId('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('data-variant', 'bordered')
      expect(button).toHaveTextContent('Manage this model')
    })

    it('renders as a button element', () => {
      render(<ModelSearchViewDownloadedButton />)

      const button = screen.getByTestId('button')
      expect(button.tagName).toBe('BUTTON')
    })
  })

  describe('User Interaction', () => {
    it('opens settings modal with models tab when clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<ModelSearchViewDownloadedButton />)

      // Act
      const button = screen.getByTestId('button')
      await user.click(button)

      // Assert
      expect(mockOpenModal).toHaveBeenCalledTimes(1)
      expect(mockOpenModal).toHaveBeenCalledWith(SettingsTab.MODELS)
    })

    it('opens modal to models tab specifically, not general tab', async () => {
      const user = userEvent.setup()
      render(<ModelSearchViewDownloadedButton />)

      const button = screen.getByTestId('button')
      await user.click(button)

      // Verify it's called with models and not other tabs
      expect(mockOpenModal).not.toHaveBeenCalledWith(SettingsTab.GENERAL)
      expect(mockOpenModal).not.toHaveBeenCalledWith(SettingsTab.UPDATES)
      expect(mockOpenModal).toHaveBeenCalledWith(SettingsTab.MODELS)
    })

    it('can be clicked multiple times', async () => {
      const user = userEvent.setup()
      render(<ModelSearchViewDownloadedButton />)

      const button = screen.getByTestId('button')
      await user.click(button)
      await user.click(button)
      await user.click(button)

      expect(mockOpenModal).toHaveBeenCalledTimes(3)
      expect(mockOpenModal).toHaveBeenCalledWith(SettingsTab.MODELS)
    })
  })
})
