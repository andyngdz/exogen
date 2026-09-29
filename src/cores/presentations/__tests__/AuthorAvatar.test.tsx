/**
 * @file Tests for the AuthorAvatar component
 *
 * Tests that the AuthorAvatar component:
 * - Renders the avatar image from the backend URL for the provided ID
 * - Passes size and className through to the Avatar root
 * - Falls back to the first letter of the ID
 */

import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthorAvatar } from '../AuthorAvatar'

// Radix Avatar renders the image only once window.Image reports it loaded
class LoadedImageMock {
  complete = true
  naturalWidth = 1
  src = ''
  addEventListener = vi.fn()
  removeEventListener = vi.fn()
}

const originalImage = window.Image

describe('AuthorAvatar', () => {
  beforeEach(() => {
    window.Image = LoadedImageMock as unknown as typeof Image
  })

  afterEach(() => {
    window.Image = originalImage
  })

  it('renders the avatar image from the backend URL based on the ID', () => {
    render(<AuthorAvatar id="test-author-123" />)

    expect(
      screen.getByRole('img', { name: 'test-author-123' })
    ).toHaveAttribute(
      'src',
      'http://localhost:8000/users/avatar/test-author-123.png'
    )
  })

  it('uses the provided alt text and passes size and className to the root', () => {
    const { container } = render(
      <AuthorAvatar
        id="test-author"
        alt="Author Profile Picture"
        className="custom-avatar"
        size="lg"
      />
    )

    expect(
      screen.getByRole('img', { name: 'Author Profile Picture' })
    ).toBeInTheDocument()
    expect(container.firstElementChild).toHaveClass(
      'custom-avatar',
      'avatar--lg'
    )
  })

  it('shows the first letter of the ID while the image is not loaded', () => {
    window.Image = originalImage
    render(<AuthorAvatar id="zeta" />)

    expect(screen.getByText('z')).toBeInTheDocument()
  })
})
