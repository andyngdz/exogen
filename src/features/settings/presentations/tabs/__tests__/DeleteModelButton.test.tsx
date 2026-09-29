import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DeleteModelButton } from '../DeleteModelButton'

// Mock the useDeleteModel hook
const mockMutate = vi.fn()
const mockUseDeleteModel = vi.fn(() => ({
  mutate: mockMutate,
  isPending: false
}))

vi.mock('@/features/settings/states/useDeleteModel', () => ({
  useDeleteModel: () => mockUseDeleteModel()
}))

const testModelId = 'test-model-123'

const getDeleteModelButton = () =>
  screen.getByRole('button', { name: `Delete ${testModelId}` })

const openConfirmDialog = async () => {
  const user = userEvent.setup()
  render(<DeleteModelButton model_id={testModelId} />)
  await user.click(getDeleteModelButton())

  return user
}

describe('DeleteModelButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseDeleteModel.mockReturnValue({
      mutate: mockMutate,
      isPending: false
    })
  })

  describe('modal state management', () => {
    it('does not show the dialog before the button is pressed', () => {
      render(<DeleteModelButton model_id={testModelId} />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('opens the confirm dialog naming the model', async () => {
      await openConfirmDialog()

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: 'Delete model' })
      ).toBeInTheDocument()
      expect(
        screen.getByText('Are you sure you want to delete this model?')
      ).toBeInTheDocument()
      expect(screen.getByText(testModelId)).toBeInTheDocument()
    })

    it('closes the dialog without deleting when cancel is pressed', async () => {
      const user = await openConfirmDialog()

      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
      expect(mockMutate).not.toHaveBeenCalled()
    })

    it('can be reopened after cancelling', async () => {
      const user = await openConfirmDialog()

      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
      await user.click(getDeleteModelButton())

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('onConfirm behavior', () => {
    it('deletes the model by id and closes the dialog', async () => {
      const user = await openConfirmDialog()

      await user.click(screen.getByRole('button', { name: 'Delete' }))

      expect(mockMutate).toHaveBeenCalledTimes(1)
      expect(mockMutate).toHaveBeenCalledWith(testModelId)
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })

  describe('loading states', () => {
    it('disables delete button when deletion is pending', () => {
      mockUseDeleteModel.mockReturnValue({
        mutate: mockMutate,
        isPending: true
      })

      render(<DeleteModelButton model_id={testModelId} />)

      expect(getDeleteModelButton()).toBeDisabled()
    })
  })
})
