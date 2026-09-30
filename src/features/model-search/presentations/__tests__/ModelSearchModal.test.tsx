import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ModelSearchModal } from '../ModelSearchModal'

vi.mock('../ModelSearchContainer', () => ({
  ModelSearchContainer: () => <div data-testid="model-search-container" />
}))

describe('ModelSearchModal', () => {
  it('renders model search when open', () => {
    render(<ModelSearchModal isOpen onOpenChange={vi.fn()} />)

    expect(screen.getByText('Model search')).toBeInTheDocument()
    expect(screen.getByTestId('model-search-container')).toBeInTheDocument()
  })

  it('renders nothing when closed', () => {
    render(<ModelSearchModal isOpen={false} onOpenChange={vi.fn()} />)

    expect(screen.queryByText('Model search')).not.toBeInTheDocument()
  })
})
