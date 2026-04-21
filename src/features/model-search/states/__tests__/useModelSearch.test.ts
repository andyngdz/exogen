import { createQueryClientWrapper } from '@/cores/test-utils'
import { api } from '@/services/api'
import { ModelSearchResponse } from '@/types/models'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest'
import { useModelSearch } from '../useModelSearch'
import * as selectorStores from '../useModelSearchSelectorStores'

// Create a mock watch function that we can control directly
const mockWatch = vi.fn()

// Mock API
vi.mock('@/services/api', () => ({
  api: {
    searchModel: vi.fn()
  }
}))

// Mock selector handlers
vi.mock('../useModelSearchSelectorStores', () => ({
  onResetModelId: vi.fn(),
  onUpdateModelId: vi.fn()
}))

// Mock react-hook-form to just focus on what we use
vi.mock('react-hook-form', () => ({
  useFormContext: () => ({
    watch: mockWatch
  })
}))

// Import after mocks
const mockSearchModel = api.searchModel as MockedFunction<
  typeof api.searchModel
>
const mockOnResetModelId = vi.mocked(selectorStores.onResetModelId)
const mockOnUpdateModelId = vi.mocked(selectorStores.onUpdateModelId)

describe('useModelSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default empty query
    mockWatch.mockReturnValue('')
  })

  it('should search models and update model ID when results exist', async () => {
    // Arrange
    const mockQuery = 'stable diffusion'

    // Set up mock to return our query
    mockWatch.mockReturnValue(mockQuery)

    const typedResponse: ModelSearchResponse = {
      models_search_info: [
        {
          id: 'model-1',
          author: 'test',
          likes: 100,
          downloads: 500,
          tags: ['test-tag'],
          is_downloaded: false
        }
      ]
    }
    mockSearchModel.mockResolvedValueOnce(typedResponse)

    // Act
    const { result } = renderHook(() => useModelSearch(), {
      wrapper: createQueryClientWrapper()
    })

    // Initial state
    expect(result.current.isLoading).toBe(true)

    // Wait for query to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Assert
    expect(mockSearchModel).toHaveBeenCalledWith(mockQuery)
    expect(result.current.data).toEqual(typedResponse.models_search_info)
    expect(mockOnResetModelId).toHaveBeenCalled()
    expect(mockOnUpdateModelId).toHaveBeenCalledWith('model-1')
  })

  it('should reset model ID on query change but not update when no results', async () => {
    // Arrange
    const mockQuery = 'nonexistent model'

    // Set up mock to return our query
    mockWatch.mockReturnValue(mockQuery)

    const emptyResponse: ModelSearchResponse = {
      models_search_info: [] // Empty results
    }
    mockSearchModel.mockResolvedValueOnce(emptyResponse)

    // Act
    const { result } = renderHook(() => useModelSearch(), {
      wrapper: createQueryClientWrapper()
    })

    // Wait for query to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Assert
    expect(mockSearchModel).toHaveBeenCalledWith(mockQuery)
    expect(result.current.data).toEqual(emptyResponse.models_search_info)
    expect(mockOnResetModelId).toHaveBeenCalled()
    expect(mockOnUpdateModelId).not.toHaveBeenCalled()
  })

  it('should handle API errors gracefully', async () => {
    // Arrange
    const mockQuery = 'error query'
    const mockError = new Error('API error')

    // Set up mock to return our query
    mockWatch.mockReturnValue(mockQuery)

    mockSearchModel.mockRejectedValueOnce(mockError)

    // Act
    const { result } = renderHook(() => useModelSearch(), {
      wrapper: createQueryClientWrapper()
    })

    // Wait for query to fail
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Assert
    expect(mockSearchModel).toHaveBeenCalledWith(mockQuery)
    expect(result.current.data).toEqual([])
    expect(mockOnResetModelId).toHaveBeenCalled()
    expect(mockOnUpdateModelId).not.toHaveBeenCalled()
  })
})
