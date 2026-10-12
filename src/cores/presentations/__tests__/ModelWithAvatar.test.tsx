/**
 * @file Tests for the ModelWithAvatar component
 *
 * Tests that the ModelWithAvatar component:
 * - Renders with the correct AuthorAvatar component
 * - Displays the model ID as text
 * - Passes correct props to AuthorAvatar
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ModelWithAvatar, ModelWithAvatarProps } from '../ModelWithAvatar'

// Mock the AuthorAvatar component
vi.mock('../AuthorAvatar', () => ({
  AuthorAvatar: vi.fn(({ id, size, alt, className }) => (
    <div
      data-testid="mock-author-avatar"
      data-author-id={id}
      data-size={size}
      data-alt={alt}
      data-class-name={className}
    >
      Mock Avatar
    </div>
  ))
}))

describe('ModelWithAvatar', () => {
  it('renders with the correct AuthorAvatar and model ID', () => {
    // Arrange
    const props: ModelWithAvatarProps = {
      author: 'test-author',
      id: 'test-model'
    }

    // Act
    render(<ModelWithAvatar {...props} />)

    // Assert
    const avatarElement = screen.getByTestId('mock-author-avatar')
    const modelIdText = screen.getByText('test-model')

    // Verify Avatar props
    expect(avatarElement).toBeInTheDocument()
    expect(avatarElement).toHaveAttribute('data-author-id', 'test-author')
    expect(avatarElement).toHaveAttribute('data-size', 'sm')
    expect(avatarElement).toHaveAttribute('data-alt', 'test-model')
    expect(avatarElement).toHaveAttribute('data-class-name', 'w-4 h-4')

    // Verify model ID is displayed
    expect(modelIdText).toBeInTheDocument()
  })

  it('updates AuthorAvatar when props change', () => {
    // Arrange
    const props: ModelWithAvatarProps = {
      author: 'initial-author',
      id: 'initial-model'
    }

    // Act - initial render
    const { rerender } = render(<ModelWithAvatar {...props} />)

    // Assert initial state
    expect(screen.getByTestId('mock-author-avatar')).toHaveAttribute(
      'data-author-id',
      'initial-author'
    )
    expect(screen.getByText('initial-model')).toBeInTheDocument()

    // Act - rerender with new props
    rerender(<ModelWithAvatar author="updated-author" id="updated-model" />)

    // Assert updated state
    expect(screen.getByTestId('mock-author-avatar')).toHaveAttribute(
      'data-author-id',
      'updated-author'
    )
    expect(screen.getByText('updated-model')).toBeInTheDocument()
  })

  it('renders with the correct layout and styling', () => {
    // Arrange
    render(<ModelWithAvatar author="test-author" id="test-model" />)

    // Act
    const container = screen.getByText('test-model').parentElement

    // Assert
    expect(container).toHaveClass('flex', 'items-center', 'gap-2')
    expect(screen.getByText('test-model')).toHaveClass('text-left', 'text-sm')
  })
})
