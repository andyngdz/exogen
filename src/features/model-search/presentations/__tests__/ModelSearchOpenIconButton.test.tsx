import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ModelSearchOpenIconButton } from '../ModelSearchOpenIconButton'

// Mock the ModelSearchContainer component
vi.mock('../ModelSearchContainer', () => ({
  ModelSearchContainer: vi.fn(() => (
    <div data-testid="model-search-container">Model Search Container</div>
  ))
}))

const getOpenButton = () =>
  screen.getByRole('button', { name: 'Open model search' })

const openModal = async () => {
  const user = userEvent.setup()
  render(<ModelSearchOpenIconButton />)
  await user.click(getOpenButton())

  return user
}

describe('ModelSearchOpenIconButton', () => {
  describe('Component Rendering', () => {
    it('renders a labelled icon button inside a section', () => {
      const { container } = render(<ModelSearchOpenIconButton />)

      const button = getOpenButton()
      expect(container.querySelector('section')).toContainElement(button)
      expect(button.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Modal State Management', () => {
    it('modal is initially closed', () => {
      render(<ModelSearchOpenIconButton />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('model-search-container')
      ).not.toBeInTheDocument()
    })

    it('opens the modal with its heading, separator and content', async () => {
      await openModal()

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: 'Model search' })
      ).toBeInTheDocument()
      expect(screen.getByRole('separator')).toBeInTheDocument()
      expect(screen.getByTestId('model-search-container')).toBeInTheDocument()
    })

    it('can close the modal', async () => {
      const user = await openModal()

      await user.click(screen.getByRole('button', { name: /close/i }))

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('closes the modal on Escape', async () => {
      const user = await openModal()

      await user.keyboard('{Escape}')

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })

  describe('User Interactions', () => {
    it('opens the modal from the keyboard', async () => {
      const user = userEvent.setup()
      render(<ModelSearchOpenIconButton />)

      await user.tab()
      expect(getOpenButton()).toHaveFocus()
      await user.keyboard('{Enter}')

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })
})
