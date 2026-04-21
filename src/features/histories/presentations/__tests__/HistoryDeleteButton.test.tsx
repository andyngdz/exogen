import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HistoryItem } from '@/types'
import { HistoryDeleteButton } from '../HistoryDeleteButton'

const mockMutate = vi.fn()
const mockUseDeleteHistory = vi.fn(() => ({
  mutate: mockMutate,
  isPending: false
}))

vi.mock('@/features/histories/states/useDeleteHistory', () => ({
  useDeleteHistory: () => mockUseDeleteHistory()
}))

vi.mock('@/services', () => ({
  dateFormatter: {
    datetime: vi.fn((date: string) => `Formatted: ${date}`)
  }
}))

vi.mock('@heroui/react', async () => {
  const actual =
    await vi.importActual<typeof import('@heroui/react')>('@heroui/react')
  return {
    ...actual,
    Button: ({
      children,
      onPress,
      isDisabled,
      isLoading,
      variant,
      color,
      isIconOnly,
      size,
      'aria-label': ariaLabel,
      'data-testid': dataTestId
    }: {
      children: React.ReactNode
      onPress?: () => void
      isDisabled?: boolean
      isLoading?: boolean
      variant?: string
      color?: string
      isIconOnly?: boolean
      size?: string
      'aria-label'?: string
      'data-testid'?: string
    }) => (
      <button
        onClick={onPress}
        disabled={isDisabled || isLoading}
        data-variant={variant}
        data-color={color}
        data-icon-only={isIconOnly}
        data-size={size}
        aria-label={ariaLabel}
        data-testid={dataTestId}
        data-loading={isLoading}
      >
        {children}
      </button>
    ),
    Modal: ({
      children,
      isOpen
    }: {
      children: React.ReactNode
      isOpen: boolean
      onClose: () => void
    }) =>
      isOpen ? (
        <div data-testid="modal" role="dialog">
          {children}
        </div>
      ) : null,
    ModalContent: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="modal-content">{children}</div>
    ),
    ModalHeader: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="modal-header">{children}</div>
    ),
    ModalBody: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="modal-body">{children}</div>
    ),
    ModalFooter: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="modal-footer">{children}</div>
    ),
    Tooltip: ({
      children,
      content
    }: {
      children: React.ReactNode
      content: string
    }) => (
      <div data-testid="tooltip" data-tooltip-content={content}>
        {children}
      </div>
    )
  }
})

vi.mock('lucide-react', () => ({
  Trash2: ({ size }: { size?: number }) => (
    <svg data-testid="trash-icon" data-size={size}>
      <title>Trash</title>
    </svg>
  )
}))

describe('HistoryDeleteButton', () => {
  const mockHistory: HistoryItem = {
    id: 123,
    created_at: '2024-01-15T10:30:00',
    updated_at: '2024-01-15T10:30:00',
    prompt: 'Test prompt',
    model: 'test-model',
    config: {
      width: 512,
      height: 512,
      steps: 20,
      cfg_scale: 7,
      clip_skip: 2,
      sampler: 'Euler',
      seed: 42,
      number_of_images: 1,

      loras: [],
      prompt: 'Test prompt',
      negative_prompt: '',
      styles: []
    },
    generated_images: []
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseDeleteHistory.mockReturnValue({
      mutate: mockMutate,
      isPending: false
    })
  })

  describe('onConfirm function behavior', () => {
    it('should call deleteHistory.mutate with the correct history id when onConfirm is triggered', async () => {
      render(<HistoryDeleteButton history={mockHistory} />)

      const deleteButton = screen.getByTestId('delete-button')
      fireEvent.click(deleteButton)

      expect(screen.getByTestId('modal')).toBeInTheDocument()

      const buttons = screen.getAllByRole('button')
      const confirmButton = buttons.find(
        (button) =>
          button.textContent === 'Delete' &&
          button.getAttribute('data-color') === 'danger'
      )
      expect(confirmButton).toBeDefined()
      fireEvent.click(confirmButton!)

      expect(mockMutate).toHaveBeenCalledWith(123)
      expect(mockMutate).toHaveBeenCalledTimes(1)
    })

    it('should close the modal when onConfirm is triggered', async () => {
      render(<HistoryDeleteButton history={mockHistory} />)

      const deleteButton = screen.getByTestId('delete-button')
      fireEvent.click(deleteButton)

      expect(screen.getByTestId('modal')).toBeInTheDocument()

      const buttons = screen.getAllByRole('button')
      const confirmButton = buttons.find(
        (button) =>
          button.textContent === 'Delete' &&
          button.getAttribute('data-color') === 'danger'
      )
      expect(confirmButton).toBeDefined()
      fireEvent.click(confirmButton!)

      await waitFor(() => {
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
      })
    })
  })

  describe('modal state management', () => {
    it('should open modal when delete button is clicked', () => {
      render(<HistoryDeleteButton history={mockHistory} />)

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()

      const deleteButton = screen.getByTestId('delete-button')
      fireEvent.click(deleteButton)

      expect(screen.getByTestId('modal')).toBeInTheDocument()
    })

    it('should close modal when cancel button is clicked', async () => {
      render(<HistoryDeleteButton history={mockHistory} />)

      const deleteButton = screen.getByTestId('delete-button')
      fireEvent.click(deleteButton)

      expect(screen.getByTestId('modal')).toBeInTheDocument()

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
      })

      expect(mockMutate).not.toHaveBeenCalled()
    })

    it('should display formatted datetime in the modal body', () => {
      render(<HistoryDeleteButton history={mockHistory} />)

      const deleteButton = screen.getByTestId('delete-button')
      fireEvent.click(deleteButton)

      expect(
        screen.getByText('Formatted: 2024-01-15T10:30:00Z')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Are you sure you want to delete this history entry?')
      ).toBeInTheDocument()
    })
  })

  describe('loading states', () => {
    it('should disable delete button when deletion is pending', () => {
      mockUseDeleteHistory.mockReturnValue({
        mutate: mockMutate,
        isPending: true
      })

      render(<HistoryDeleteButton history={mockHistory} />)

      const deleteButton = screen.getByTestId('delete-button')
      expect(deleteButton).toBeDisabled()
    })
  })

  describe('accessibility', () => {
    it('should have proper aria-label on delete button', () => {
      render(<HistoryDeleteButton history={mockHistory} />)

      const deleteButton = screen.getByTestId('delete-button')
      expect(deleteButton).toHaveAttribute('aria-label', 'Delete history')
    })

    it('should render modal with proper role', () => {
      render(<HistoryDeleteButton history={mockHistory} />)

      const deleteButton = screen.getByTestId('delete-button')
      fireEvent.click(deleteButton)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should have tooltip with delete message', () => {
      render(<HistoryDeleteButton history={mockHistory} />)

      const tooltip = screen.getByTestId('tooltip')
      expect(tooltip).toHaveAttribute('data-tooltip-content', 'Delete history')
    })
  })

  describe('component structure', () => {
    it('should render trash icon with correct size', () => {
      render(<HistoryDeleteButton history={mockHistory} />)

      const trashIcon = screen.getByTestId('trash-icon')
      expect(trashIcon).toBeInTheDocument()
      expect(trashIcon).toHaveAttribute('data-size', '16')
    })

    it('should render with correct button styling attributes', () => {
      render(<HistoryDeleteButton history={mockHistory} />)

      const deleteButton = screen.getByTestId('delete-button')
      expect(deleteButton).toHaveAttribute('data-variant', 'light')
      expect(deleteButton).toHaveAttribute('data-color', 'danger')
      expect(deleteButton).toHaveAttribute('data-icon-only', 'true')
      expect(deleteButton).toHaveAttribute('data-size', 'sm')
    })

    it('should render modal content correctly', () => {
      render(<HistoryDeleteButton history={mockHistory} />)

      const deleteButton = screen.getByTestId('delete-button')
      fireEvent.click(deleteButton)

      expect(screen.getByTestId('modal-header')).toBeInTheDocument()
      expect(screen.getByTestId('modal-body')).toBeInTheDocument()
      expect(screen.getByTestId('modal-footer')).toBeInTheDocument()

      expect(screen.getByText('Delete history')).toBeInTheDocument()
      expect(
        screen.getByText('Are you sure you want to delete this history entry?')
      ).toBeInTheDocument()
    })
  })
})
