import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { ButtonProps } from '@heroui/react'
import { SettingsButton } from '../SettingsButton'

// Mock functions
const mockOpenModal = vi.fn()
const mockCloseModal = vi.fn()
let mockIsModalOpen = false

// Mock the settings store
vi.mock('../../states/useSettingsStore', () => ({
  useSettingsStore: () => ({
    isModalOpen: mockIsModalOpen,
    openModal: mockOpenModal,
    closeModal: mockCloseModal
  })
}))

// Mock the Settings icon from lucide-react
vi.mock('lucide-react', () => ({
  Settings: ({ size }: { size: number }) => (
    <svg data-testid="settings-icon" width={size} height={size}>
      <title>Settings</title>
    </svg>
  )
}))

// Mock the Button from @heroui/react
vi.mock('@heroui/react', () => ({
  Button: ({
    children,
    variant,
    className,
    onPress,
    isIconOnly,
    'aria-label': ariaLabel
  }: ButtonProps & { 'aria-label'?: string }) => (
    <button
      data-testid="settings-button"
      data-variant={variant}
      data-icon-only={isIconOnly}
      className={className}
      aria-label={ariaLabel}
      onClick={() => onPress?.({} as never)}
    >
      {children}
    </button>
  )
}))

// Mock SettingsModal component
vi.mock('../SettingsModal', () => ({
  SettingsModal: ({
    isOpen,
    onClose
  }: {
    isOpen: boolean
    onClose: VoidFunction
  }) =>
    isOpen ? (
      <div data-testid="settings-modal">
        <button data-testid="close-modal-button" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null
}))

describe('SettingsButton', () => {
  beforeEach(() => {
    mockIsModalOpen = false
    vi.clearAllMocks()
  })

  describe('Button Rendering', () => {
    it('renders the settings button with correct attributes', () => {
      render(<SettingsButton />)

      const button = screen.getByTestId('settings-button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('data-variant', 'light')
      expect(button).toHaveAttribute('data-icon-only', 'true')
      expect(button).toHaveAttribute('aria-label', 'Settings')
      expect(button).toHaveClass('text-default-700 hover:text-foreground')
    })

    it('renders the Settings icon with correct size', () => {
      render(<SettingsButton />)

      const icon = screen.getByTestId('settings-icon')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('width', '16')
      expect(icon).toHaveAttribute('height', '16')
    })
  })

  describe('Button Interaction', () => {
    it('calls openModal when button is clicked', async () => {
      const user = userEvent.setup()
      render(<SettingsButton />)

      const button = screen.getByTestId('settings-button')
      await user.click(button)

      expect(mockOpenModal).toHaveBeenCalledTimes(1)
    })
  })

  describe('Modal Integration', () => {
    it('does not render modal when isModalOpen is false', () => {
      mockIsModalOpen = false
      render(<SettingsButton />)

      expect(screen.queryByTestId('settings-modal')).not.toBeInTheDocument()
    })

    it('renders modal when isModalOpen is true', () => {
      mockIsModalOpen = true
      render(<SettingsButton />)

      expect(screen.getByTestId('settings-modal')).toBeInTheDocument()
    })

    it('passes closeModal callback to SettingsModal', async () => {
      mockIsModalOpen = true
      const user = userEvent.setup()
      render(<SettingsButton />)

      const closeButton = screen.getByTestId('close-modal-button')
      await user.click(closeButton)

      expect(mockCloseModal).toHaveBeenCalledTimes(1)
    })
  })

  describe('Component Structure', () => {
    it('renders button and modal within a container div', () => {
      render(<SettingsButton />)

      const button = screen.getByTestId('settings-button')
      expect(button.parentElement?.tagName).toBe('DIV')
    })
  })
})
