/**
 * @file Tests for the ModelSearchListModel component
 *
 * Tests that the ModelSearchListModel component:
 * - Renders a spinner when loading
 * - Displays an alert when no models are found
 * - Renders a list of ModelSearchItems when models are available
 * - Handles undefined data gracefully
 */

import { ModelSearchInfo } from '@/types'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ModelSearchListModel } from '../ModelSearchListModel'

// Mock hook for testing different states
const useModelSearchMock = vi.fn()

// Mock dependencies
vi.mock('../../states', () => ({
  useModelSearch: () => useModelSearchMock()
}))

vi.mock('../ModelSearchItem', () => ({
  ModelSearchItem: ({
    modelSearchInfo
  }: {
    modelSearchInfo: ModelSearchInfo
  }) => (
    <div
      data-testid="mock-model-search-item"
      data-model-id={modelSearchInfo.id}
    >
      Model: {modelSearchInfo.id}
    </div>
  )
}))

describe('ModelSearchListModel', () => {
  const mockModels: ModelSearchInfo[] = [
    {
      id: 'model-1',
      author: 'author-1',
      downloads: 100,
      likes: 50,
      tags: ['tag1'],
      is_downloaded: false
    },
    {
      id: 'model-2',
      author: 'author-2',
      downloads: 200,
      likes: 150,
      tags: ['tag2'],
      is_downloaded: true
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a spinner when loading', () => {
    // Setup mock for this test case
    useModelSearchMock.mockReturnValue({
      data: [],
      isLoading: true
    })

    render(<ModelSearchListModel />)

    // Should show a spinner when loading
    expect(screen.getByLabelText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('No models found')).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('mock-model-search-item')
    ).not.toBeInTheDocument()
  })

  it('shows an alert when no models are found', () => {
    // Setup mock for this test case
    useModelSearchMock.mockReturnValue({
      data: [],
      isLoading: false
    })

    render(<ModelSearchListModel />)

    // Should show an alert when no models are found
    expect(screen.getByText('No models found')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('mock-model-search-item')
    ).not.toBeInTheDocument()
  })

  it('renders a list of models when available', () => {
    // Setup mock for this test case
    useModelSearchMock.mockReturnValue({
      data: mockModels,
      isLoading: false
    })

    render(<ModelSearchListModel />)

    // Should render each model in the list
    const modelItems = screen.getAllByTestId('mock-model-search-item')
    expect(modelItems).toHaveLength(2)

    // Check that each model ID is correctly passed to ModelSearchItem
    expect(modelItems[0]).toHaveAttribute('data-model-id', 'model-1')
    expect(modelItems[1]).toHaveAttribute('data-model-id', 'model-2')

    // Check that model content is visible
    expect(screen.getByText('Model: model-1')).toBeInTheDocument()
    expect(screen.getByText('Model: model-2')).toBeInTheDocument()

    // Should not show spinner or alert
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByText('No models found')).not.toBeInTheDocument()
  })

  it('handles undefined data gracefully', () => {
    // Setup mock for this test case
    useModelSearchMock.mockReturnValue({
      data: undefined,
      isLoading: false
    })

    render(<ModelSearchListModel />)

    // When data is undefined and not loading, component should show the empty state alert
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByText('No models found')).toBeInTheDocument()
    expect(
      screen.queryByTestId('mock-model-search-item')
    ).not.toBeInTheDocument()
  })
})
