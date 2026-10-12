import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { ModelSearchViewHeaderProps } from '../ModelSearchViewHeader'
import { ModelSearchViewSpaces } from '../ModelSearchViewSpaces'

// Mock header to assert title
vi.mock('../ModelSearchViewHeader', () => ({
  ModelSearchViewHeader: ({ title }: ModelSearchViewHeaderProps) => (
    <div data-testid="header">title: {title}</div>
  )
}))

// Mock avatar to avoid external requests and simplify DOM
vi.mock('@/cores/presentations/AuthorAvatar', () => ({
  AuthorAvatar: ({ id }: { id: string }) => (
    <div data-testid="author-avatar">avatar-{id}</div>
  )
}))

const getChips = () => screen.getAllByTestId('author-avatar')
const getToggle = () => screen.getByRole('button', { name: /Show (more|less)/ })

describe('ModelSearchViewSpaces', () => {
  it('shows first 5 spaces by default and expands to all on click', async () => {
    // Arrange
    const user = userEvent.setup()
    const spaces = [
      'author1/space1',
      'author2/space2',
      'author3/space3',
      'author4/space4',
      'author5/space5',
      'author6/space6',
      'author7/space7'
    ]

    // Act
    render(<ModelSearchViewSpaces spaces={spaces} />)

    // Assert default state (first 5 chips only)
    expect(screen.getByTestId('header')).toHaveTextContent('title: Spaces')
    const chipsDefault = getChips()
    expect(chipsDefault).toHaveLength(5)
    expect(screen.getByText('author1/space1')).toBeInTheDocument()
    expect(screen.getByText('author5/space5')).toBeInTheDocument()
    expect(screen.queryByText('author6/space6')).not.toBeInTheDocument()
    expect(getToggle()).toHaveTextContent('Show more')

    // Expand
    await user.click(getToggle())

    const chipsExpanded = getChips()
    expect(chipsExpanded).toHaveLength(spaces.length)
    expect(getToggle()).toHaveTextContent('Show less')

    // Collapse
    await user.click(getToggle())

    const chipsCollapsed = getChips()
    expect(chipsCollapsed).toHaveLength(5)
    expect(getToggle()).toHaveTextContent('Show more')
  })

  it('shows all spaces when 5 or fewer are provided and still toggles text', async () => {
    // Arrange
    const user = userEvent.setup()
    const spaces = ['a/1', 'b/2', 'c/3']

    // Act
    render(<ModelSearchViewSpaces spaces={spaces} />)

    // Assert
    const chips = getChips()
    expect(chips).toHaveLength(3)
    expect(getToggle()).toHaveTextContent('Show more')

    // Toggle still flips text to "Show less"
    await user.click(getToggle())
    expect(getToggle()).toHaveTextContent('Show less')
  })
})
