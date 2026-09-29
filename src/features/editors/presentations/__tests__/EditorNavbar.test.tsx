import { mockNextImage } from '@/cores/test-utils'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EditorNavbar } from '../EditorNavbar'

// Mock the NextImage component
vi.mock('next/image', () => mockNextImage())

// Mock the ModelSelector component
vi.mock('@/features/model-selectors/presentations/ModelSelector', () => ({
  ModelSelector: () => (
    <div data-testid="mock-model-selector">Model Selector</div>
  )
}))

// Mock the ModelSearchOpenIconButton component
vi.mock('@/features/model-search', () => ({
  ModelSearchOpenIconButton: () => (
    <div data-testid="mock-search-button">Search Button</div>
  )
}))

describe('EditorNavbar', () => {
  it('renders a sticky banner with the logo', () => {
    render(<EditorNavbar />)

    expect(screen.getByRole('banner')).toHaveClass('sticky', 'top-0')
    expect(screen.getByTestId('mock-next-image')).toHaveAttribute(
      'data-alt',
      'ExoGen Logo'
    )
  })

  it('renders the model selector and search button in the navigation', () => {
    render(<EditorNavbar />)

    const navigation = within(screen.getByRole('navigation'))
    expect(navigation.getByTestId('mock-model-selector')).toBeInTheDocument()
    expect(navigation.getByTestId('mock-search-button')).toBeInTheDocument()
  })
})
