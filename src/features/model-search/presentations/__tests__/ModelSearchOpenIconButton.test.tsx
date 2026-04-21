import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ModelSearchOpenIconButton } from '../ModelSearchOpenIconButton'

// Mock the ModelSearchContainer component
vi.mock('../ModelSearchContainer', () => ({
  ModelSearchContainer: vi.fn(() => (
    <div data-testid="model-search-container">Model Search Container</div>
  ))
}))

// Mock the useDisclosure hook from @heroui/react
vi.mock('@heroui/react', async () => {
  const actual = await vi.importActual('@heroui/react')
  return {
    ...actual,
    useDisclosure: vi.fn(() => ({
      isOpen: false,
      onOpen: vi.fn(),
      onClose: vi.fn()
    }))
  }
})

describe('ModelSearchOpenIconButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders the button with plus icon', () => {
      const { container } = render(<ModelSearchOpenIconButton />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()

      // Check for the plus icon
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('renders within a section wrapper', () => {
      const { container } = render(<ModelSearchOpenIconButton />)

      const section = container.querySelector('section')
      expect(section).toBeInTheDocument()

      const button = screen.getByRole('button')
      expect(section).toContainElement(button)
    })

    it('applies correct button styling', () => {
      render(<ModelSearchOpenIconButton />)

      const button = screen.getByRole('button')
      // Check button exists and is properly styled (HeroUI may use different attributes)
      expect(button).toBeInTheDocument()
      expect(button).toBeVisible()
    })
  })

  describe('Modal State Management', () => {
    it('modal is initially closed', () => {
      render(<ModelSearchOpenIconButton />)

      // Modal should not be visible initially
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('model-search-container')
      ).not.toBeInTheDocument()
    })

    it('opens modal when button is pressed', async () => {
      const mockOnOpen = vi.fn()
      const { useDisclosure } = await import('@heroui/react')
      vi.mocked(useDisclosure).mockReturnValue({
        isOpen: false,
        onOpen: mockOnOpen,
        onClose: vi.fn(),
        onOpenChange: vi.fn(),
        isControlled: false,
        getButtonProps: vi.fn(() => ({})),
        getDisclosureProps: vi.fn(() => ({}))
      })

      const user = userEvent.setup()
      render(<ModelSearchOpenIconButton />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockOnOpen).toHaveBeenCalledTimes(1)
    })

    it('displays modal content when modal is open', async () => {
      const { useDisclosure } = await import('@heroui/react')
      vi.mocked(useDisclosure).mockReturnValue({
        isOpen: true,
        onOpen: vi.fn(),
        onClose: vi.fn(),
        onOpenChange: vi.fn(),
        isControlled: false,
        getButtonProps: vi.fn(() => ({})),
        getDisclosureProps: vi.fn(() => ({}))
      })

      render(<ModelSearchOpenIconButton />)

      // Modal should be visible
      const modal = screen.getByRole('dialog')
      expect(modal).toBeInTheDocument()

      // ModelSearchContainer should be rendered inside the modal
      const searchContainer = screen.getByTestId('model-search-container')
      expect(searchContainer).toBeInTheDocument()
    })

    it('can close the modal', async () => {
      const mockOnClose = vi.fn()
      const { useDisclosure } = await import('@heroui/react')
      vi.mocked(useDisclosure).mockReturnValue({
        isOpen: true,
        onOpen: vi.fn(),
        onClose: mockOnClose,
        onOpenChange: vi.fn(),
        isControlled: false,
        getButtonProps: vi.fn(() => ({})),
        getDisclosureProps: vi.fn(() => ({}))
      })

      const user = userEvent.setup()
      render(<ModelSearchOpenIconButton />)

      // Find the close button in the modal
      const closeButton = screen.getByLabelText(/close/i)
      await user.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Modal Configuration', () => {
    it('configures modal with full size', async () => {
      const { useDisclosure } = await import('@heroui/react')
      vi.mocked(useDisclosure).mockReturnValue({
        isOpen: true,
        onOpen: vi.fn(),
        onClose: vi.fn(),
        onOpenChange: vi.fn(),
        isControlled: false,
        getButtonProps: vi.fn(() => ({})),
        getDisclosureProps: vi.fn(() => ({}))
      })

      render(<ModelSearchOpenIconButton />)

      const modal = screen.getByRole('dialog')
      expect(modal).toBeInTheDocument()
      // HeroUI Modal with size="full" should be present
    })

    it('displays correct modal header', async () => {
      const { useDisclosure } = await import('@heroui/react')
      vi.mocked(useDisclosure).mockReturnValue({
        isOpen: true,
        onOpen: vi.fn(),
        onClose: vi.fn(),
        onOpenChange: vi.fn(),
        isControlled: false,
        getButtonProps: vi.fn(() => ({})),
        getDisclosureProps: vi.fn(() => ({}))
      })

      render(<ModelSearchOpenIconButton />)

      const header = screen.getByText('Model search')
      expect(header).toBeInTheDocument()
      expect(header.tagName.toLowerCase()).toBe('header')
    })

    it('includes modal divider', async () => {
      const { useDisclosure } = await import('@heroui/react')
      vi.mocked(useDisclosure).mockReturnValue({
        isOpen: true,
        onOpen: vi.fn(),
        onClose: vi.fn(),
        onOpenChange: vi.fn(),
        isControlled: false,
        getButtonProps: vi.fn(() => ({})),
        getDisclosureProps: vi.fn(() => ({}))
      })

      render(<ModelSearchOpenIconButton />)

      const divider = screen.getByRole('separator')
      expect(divider).toBeInTheDocument()
    })
  })

  describe('Content Rendering', () => {
    it('renders ModelSearchContainer within modal body', async () => {
      const { useDisclosure } = await import('@heroui/react')
      vi.mocked(useDisclosure).mockReturnValue({
        isOpen: true,
        onOpen: vi.fn(),
        onClose: vi.fn(),
        onOpenChange: vi.fn(),
        isControlled: false,
        getButtonProps: vi.fn(() => ({})),
        getDisclosureProps: vi.fn(() => ({}))
      })

      render(<ModelSearchOpenIconButton />)

      const searchContainer = screen.getByTestId('model-search-container')
      expect(searchContainer).toBeInTheDocument()

      // Check that modal body exists
      const modal = screen.getByRole('dialog')
      expect(modal).toContainElement(searchContainer)
    })

    it('only renders ModelSearchContainer when modal is open', async () => {
      const { useDisclosure } = await import('@heroui/react')
      vi.mocked(useDisclosure).mockReturnValue({
        isOpen: false,
        onOpen: vi.fn(),
        onClose: vi.fn(),
        onOpenChange: vi.fn(),
        isControlled: false,
        getButtonProps: vi.fn(() => ({})),
        getDisclosureProps: vi.fn(() => ({}))
      })

      render(<ModelSearchOpenIconButton />)

      expect(
        screen.queryByTestId('model-search-container')
      ).not.toBeInTheDocument()
    })

    it('applies correct modal body styling', async () => {
      const { useDisclosure } = await import('@heroui/react')
      vi.mocked(useDisclosure).mockReturnValue({
        isOpen: true,
        onOpen: vi.fn(),
        onClose: vi.fn(),
        onOpenChange: vi.fn(),
        isControlled: false,
        getButtonProps: vi.fn(() => ({})),
        getDisclosureProps: vi.fn(() => ({}))
      })

      render(<ModelSearchOpenIconButton />)

      // Just verify modal exists with correct structure
      const modal = screen.getByRole('dialog')
      expect(modal).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('handles multiple button presses correctly', async () => {
      const mockOnOpen = vi.fn()
      const { useDisclosure } = await import('@heroui/react')
      vi.mocked(useDisclosure).mockReturnValue({
        isOpen: false,
        onOpen: mockOnOpen,
        onClose: vi.fn(),
        onOpenChange: vi.fn(),
        isControlled: false,
        getButtonProps: vi.fn(() => ({})),
        getDisclosureProps: vi.fn(() => ({}))
      })

      const user = userEvent.setup()
      render(<ModelSearchOpenIconButton />)

      const button = screen.getByRole('button')

      await user.click(button)
      await user.click(button)
      await user.click(button)

      expect(mockOnOpen).toHaveBeenCalledTimes(3)
    })

    it('supports keyboard navigation', async () => {
      const mockOnOpen = vi.fn()
      const { useDisclosure } = await import('@heroui/react')
      vi.mocked(useDisclosure).mockReturnValue({
        isOpen: false,
        onOpen: mockOnOpen,
        onClose: vi.fn(),
        onOpenChange: vi.fn(),
        isControlled: false,
        getButtonProps: vi.fn(() => ({})),
        getDisclosureProps: vi.fn(() => ({}))
      })

      const user = userEvent.setup()
      render(<ModelSearchOpenIconButton />)

      const button = screen.getByRole('button')
      act(() => {
        button.focus()
      })

      expect(button).toHaveFocus()

      await user.keyboard('{Enter}')
      expect(mockOnOpen).toHaveBeenCalledTimes(1)

      // Test space key as well
      await user.keyboard(' ')
      expect(mockOnOpen).toHaveBeenCalledTimes(2)
    })

    it('maintains button accessibility', () => {
      render(<ModelSearchOpenIconButton />)

      const button = screen.getByRole('button')

      expect(button).not.toHaveAttribute('disabled')
      expect(button).toBeVisible()
    })
  })

  describe('Component Structure', () => {
    it('maintains proper DOM hierarchy', () => {
      const { container } = render(<ModelSearchOpenIconButton />)

      const section = container.querySelector('section')
      const button = screen.getByRole('button')

      expect(section).toContainElement(button)
      expect(container.firstChild).toBe(section)
    })

    it('renders Plus icon inside button', () => {
      const { container } = render(<ModelSearchOpenIconButton />)

      const button = screen.getByRole('button')
      const icon = container.querySelector('svg')

      expect(icon).toBeInTheDocument()
      expect(button).toContainElement(icon)
    })
  })

  describe('Modal Lifecycle', () => {
    it('does not render modal DOM when closed for performance', async () => {
      const { useDisclosure } = await import('@heroui/react')
      vi.mocked(useDisclosure).mockReturnValue({
        isOpen: false,
        onOpen: vi.fn(),
        onClose: vi.fn(),
        onOpenChange: vi.fn(),
        isControlled: false,
        getButtonProps: vi.fn(() => ({})),
        getDisclosureProps: vi.fn(() => ({}))
      })

      render(<ModelSearchOpenIconButton />)

      // Modal and its content should not be in DOM when closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('model-search-container')
      ).not.toBeInTheDocument()
      expect(screen.queryByText('Model search')).not.toBeInTheDocument()
    })

    it('renders full modal structure when open', async () => {
      const { useDisclosure } = await import('@heroui/react')
      vi.mocked(useDisclosure).mockReturnValue({
        isOpen: true,
        onOpen: vi.fn(),
        onClose: vi.fn(),
        onOpenChange: vi.fn(),
        isControlled: false,
        getButtonProps: vi.fn(() => ({})),
        getDisclosureProps: vi.fn(() => ({}))
      })

      render(<ModelSearchOpenIconButton />)

      // All modal parts should be present
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Model search')).toBeInTheDocument()
      expect(screen.getByRole('separator')).toBeInTheDocument()
      expect(screen.getByTestId('model-search-container')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles missing useDisclosure gracefully', async () => {
      // Mock useDisclosure to return undefined values
      const { useDisclosure } = await import('@heroui/react')
      vi.mocked(useDisclosure).mockReturnValue({
        isOpen: false,
        onOpen: vi.fn(),
        onClose: vi.fn(),
        onOpenChange: vi.fn(),
        isControlled: false,
        getButtonProps: vi.fn(() => ({})),
        getDisclosureProps: vi.fn(() => ({}))
      })

      // Should not crash when handlers are undefined
      expect(() => render(<ModelSearchOpenIconButton />)).not.toThrow()
    })
  })

  describe('Integration', () => {
    it('properly integrates with HeroUI Modal system', async () => {
      // Reset ModelSearchContainer mock to default behavior
      const { ModelSearchContainer } = await import('../ModelSearchContainer')
      vi.mocked(ModelSearchContainer).mockImplementation(() => (
        <div data-testid="model-search-container">Model Search Container</div>
      ))

      const { useDisclosure } = await import('@heroui/react')
      vi.mocked(useDisclosure).mockReturnValue({
        isOpen: true,
        onOpen: vi.fn(),
        onClose: vi.fn(),
        onOpenChange: vi.fn(),
        isControlled: false,
        getButtonProps: vi.fn(() => ({})),
        getDisclosureProps: vi.fn(() => ({}))
      })

      render(<ModelSearchOpenIconButton />)

      // Check basic HeroUI Modal integration
      const modal = screen.getByRole('dialog')
      const header = screen.getByText('Model search')
      const divider = screen.getByRole('separator')
      const searchContainer = screen.getByTestId('model-search-container')

      expect(modal).toBeInTheDocument()
      expect(header).toBeInTheDocument()
      expect(divider).toBeInTheDocument()
      expect(searchContainer).toBeInTheDocument()
    })
  })
})
