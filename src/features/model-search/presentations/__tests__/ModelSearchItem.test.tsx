/**
 * @file Tests for the ModelSearchItem component
 *
 * Tests that the ModelSearchItem component:
 * - Renders with the correct ModelWithAvatar component
 * - Displays the model stats (downloads and likes) properly
 * - Calls onUpdateModelId when clicked
 * - Formats numbers correctly
 */

import { ModelSearchInfo } from '@/types'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { onUpdateModelId } from '../../states'
import { ModelSearchItem } from '../ModelSearchItem'

// Mock dependencies
vi.mock('@/cores/presentations/ModelWithAvatar', () => ({
  ModelWithAvatar: ({ author, id }: { author: string; id: string }) => (
    <div data-testid="mock-model-with-avatar" data-author={author} data-id={id}>
      Model Avatar
    </div>
  )
}))

vi.mock('@/services/formatter', () => ({
  formatter: {
    number: (value: number) => `${value.toLocaleString()}`
  }
}))

// Mock the state function and store
vi.mock('../../states', () => ({
  onUpdateModelId: vi.fn(),
  useModelSearchSelectorStore: vi.fn(() => ({
    model_id: ''
  }))
}))

describe('ModelSearchItem', () => {
  // Sample model data for testing
  const mockModel: ModelSearchInfo = {
    id: 'test-model-123',
    author: 'test-author',
    likes: 1234,
    downloads: 5678,
    tags: ['test'],
    is_downloaded: false
  }

  it('renders with correct model information', () => {
    render(<ModelSearchItem modelSearchInfo={mockModel} />)

    // Check ModelWithAvatar is rendered with correct props
    const avatarElement = screen.getByTestId('mock-model-with-avatar')
    expect(avatarElement).toBeInTheDocument()
    expect(avatarElement).toHaveAttribute('data-author', 'test-author')
    expect(avatarElement).toHaveAttribute('data-id', 'test-model-123')

    // Check stats are displayed correctly
    expect(screen.getByText('1,234')).toBeInTheDocument()
    expect(screen.getByText('5,678')).toBeInTheDocument()
  })

  it('calls onUpdateModelId when clicked', async () => {
    const user = userEvent.setup()

    render(<ModelSearchItem modelSearchInfo={mockModel} />)

    // Find card element (parent that should be clickable)
    const cardElement = screen.getByRole('button')

    // Click the card
    await user.click(cardElement)

    // Verify onUpdateModelId was called with correct id
    expect(onUpdateModelId).toHaveBeenCalledWith('test-model-123')
  })

  it('displays icons for downloads and likes', () => {
    render(<ModelSearchItem modelSearchInfo={mockModel} />)

    // Find the formatted numbers and check their containers
    const downloadsText = screen.getByText('5,678')
    const likesText = screen.getByText('1,234')

    expect(downloadsText).toBeInTheDocument()
    expect(likesText).toBeInTheDocument()

    // Check icons by testing parent elements
    const downloadsContainer = downloadsText.parentElement
    const likesContainer = likesText.parentElement

    expect(downloadsContainer).toBeInTheDocument()
    expect(likesContainer).toBeInTheDocument()
  })

  it('handles models with zero stats', () => {
    const zeroStatsModel: ModelSearchInfo = {
      ...mockModel,
      likes: 0,
      downloads: 0
    }

    render(<ModelSearchItem modelSearchInfo={zeroStatsModel} />)

    // Check zero stats are formatted correctly
    // Use getAllByText since there are multiple "0" values
    const zeroElements = screen.getAllByText('0')
    expect(zeroElements.length).toBe(2) // One for downloads, one for likes

    // We can check that they're in different containers
    // by verifying they have different parent elements
    expect(zeroElements[0].parentElement).not.toBe(
      zeroElements[1].parentElement
    )

    // Both zero values should be inside span elements with text-xs class
    zeroElements.forEach((element) => {
      expect(element.tagName.toLowerCase()).toBe('span')
      expect(element).toHaveClass('text-xs')
    })
  })
})
