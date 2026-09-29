import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

const getDeleteHistoryButton = () =>
  screen.getByRole('button', { name: 'Delete history' })

const openConfirmDialog = async () => {
  const user = userEvent.setup()
  render(<HistoryDeleteButton history={mockHistory} />)
  await user.click(getDeleteHistoryButton())

  return user
}

describe('HistoryDeleteButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseDeleteHistory.mockReturnValue({
      mutate: mockMutate,
      isPending: false
    })
  })

  describe('modal state management', () => {
    it('does not show the dialog before the button is pressed', () => {
      render(<HistoryDeleteButton history={mockHistory} />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('opens the confirm dialog when delete button is pressed', async () => {
      await openConfirmDialog()

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: 'Delete history' })
      ).toBeInTheDocument()
      expect(
        screen.getByText('Are you sure you want to delete this history entry?')
      ).toBeInTheDocument()
    })

    it('displays formatted datetime in the dialog body', async () => {
      await openConfirmDialog()

      expect(
        screen.getByText('Formatted: 2024-01-15T10:30:00Z')
      ).toBeInTheDocument()
    })

    it('closes the dialog without deleting when cancel is pressed', async () => {
      const user = await openConfirmDialog()

      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
      expect(mockMutate).not.toHaveBeenCalled()
    })
  })

  describe('onConfirm behavior', () => {
    it('deletes the history by id and closes the dialog', async () => {
      const user = await openConfirmDialog()

      await user.click(screen.getByRole('button', { name: 'Delete' }))

      expect(mockMutate).toHaveBeenCalledWith(123)
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })

  describe('loading states', () => {
    it('disables delete button when deletion is pending', () => {
      mockUseDeleteHistory.mockReturnValue({
        mutate: mockMutate,
        isPending: true
      })

      render(<HistoryDeleteButton history={mockHistory} />)

      expect(getDeleteHistoryButton()).toBeDisabled()
    })
  })

  describe('accessibility', () => {
    it('shows the delete tooltip when the button gets keyboard focus', async () => {
      const user = userEvent.setup()
      render(<HistoryDeleteButton history={mockHistory} />)

      await user.tab()

      expect(getDeleteHistoryButton()).toHaveFocus()
      expect(await screen.findByRole('tooltip')).toHaveTextContent(
        'Delete history'
      )
    })
  })
})
