import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  onCreateDefaultItem,
  onCreateDefaultImageStepEnd,
  useUseImageGenerationStore
} from '../useImageGenerationResponseStores'
import type {
  ImageGenerationResponse,
  ImageGenerationStepEndResponse,
  HistoryGeneratedImage
} from '@/types'

// Note: Not mocking immer middleware as it works well in tests

describe('onCreateDefaultItem', () => {
  it('should create a default ImageGenerationItem with empty values', () => {
    const defaultItem = onCreateDefaultItem()

    expect(defaultItem).toEqual({
      path: '',
      file_name: ''
    })
  })
})

describe('onCreateDefaultImageStepEnd', () => {
  it('should create a default ImageGenerationStepEndResponse with correct index', () => {
    const index = 5
    const defaultStepEnd = onCreateDefaultImageStepEnd(index)

    expect(defaultStepEnd).toEqual({
      index: 5,
      current_step: 0,
      timestep: 0,
      image_base64: ''
    })
  })

  it('should create different indices for different parameters', () => {
    const stepEnd1 = onCreateDefaultImageStepEnd(0)
    const stepEnd2 = onCreateDefaultImageStepEnd(3)

    expect(stepEnd1.index).toBe(0)
    expect(stepEnd2.index).toBe(3)
  })
})

describe('useUseImageGenerationStore', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with empty arrays', () => {
    const { result } = renderHook(() => useUseImageGenerationStore())

    expect(result.current.imageStepEnds).toEqual([])
    expect(result.current.items).toEqual([])
    expect(result.current.nsfw_content_detected).toEqual([])
  })
})

describe('useUseImageGenerationStore - onInit', () => {
  it('should initialize arrays with correct count of default items', () => {
    const { result } = renderHook(() => useUseImageGenerationStore())

    act(() => {
      result.current.onInit(3)
    })

    expect(result.current.imageStepEnds).toHaveLength(3)
    expect(result.current.items).toHaveLength(3)
    expect(result.current.nsfw_content_detected).toHaveLength(3)

    // Check that imageStepEnds have correct indices
    const imageStepEnds = result.current.imageStepEnds
    expect(imageStepEnds[0]).toEqual({
      index: 0,
      current_step: 0,
      timestep: 0,
      image_base64: ''
    })
    expect(imageStepEnds[1]).toEqual({
      index: 1,
      current_step: 0,
      timestep: 0,
      image_base64: ''
    })
    expect(imageStepEnds[2]).toEqual({
      index: 2,
      current_step: 0,
      timestep: 0,
      image_base64: ''
    })

    // Check that items are default empty items
    const items = result.current.items
    expect(items[0]).toEqual({ path: '', file_name: '' })
    expect(items[1]).toEqual({ path: '', file_name: '' })
    expect(items[2]).toEqual({ path: '', file_name: '' })

    // Check that nsfw_content_detected are all false
    expect(result.current.nsfw_content_detected).toEqual([false, false, false])
  })

  it('should handle zero count initialization', () => {
    const { result } = renderHook(() => useUseImageGenerationStore())

    act(() => {
      result.current.onInit(0)
    })

    expect(result.current.imageStepEnds).toEqual([])
    expect(result.current.items).toEqual([])
    expect(result.current.nsfw_content_detected).toEqual([])
  })

  it('should replace existing items when called multiple times', () => {
    const { result } = renderHook(() => useUseImageGenerationStore())

    // First initialization
    act(() => {
      result.current.onInit(2)
    })

    expect(result.current.items).toHaveLength(2)

    // Second initialization with different count
    act(() => {
      result.current.onInit(4)
    })

    expect(result.current.items).toHaveLength(4)
    expect(result.current.imageStepEnds).toHaveLength(4)
    expect(result.current.nsfw_content_detected).toHaveLength(4)
  })
})

describe('useUseImageGenerationStore - onCompleted', () => {
  it('should update items and nsfw_content_detected from response', () => {
    const { result } = renderHook(() => useUseImageGenerationStore())

    const mockResponse: ImageGenerationResponse = {
      items: [
        { path: '/path/to/image1.png', file_name: 'image1.png' },
        { path: '/path/to/image2.png', file_name: 'image2.png' }
      ],
      nsfw_content_detected: [false, true]
    }

    act(() => {
      result.current.onCompleted(mockResponse)
    })

    expect(result.current.items).toEqual(mockResponse.items)
    expect(result.current.nsfw_content_detected).toEqual(
      mockResponse.nsfw_content_detected
    )
  })

  it('should handle empty response', () => {
    const { result } = renderHook(() => useUseImageGenerationStore())

    const mockResponse: ImageGenerationResponse = {
      items: [],
      nsfw_content_detected: []
    }

    act(() => {
      result.current.onCompleted(mockResponse)
    })

    expect(result.current.items).toEqual([])
    expect(result.current.nsfw_content_detected).toEqual([])
  })
})

describe('useUseImageGenerationStore - onUpdateImageStepEnd', () => {
  it('should update specific image step end by index', () => {
    const { result } = renderHook(() => useUseImageGenerationStore())

    // Initialize with some items first
    act(() => {
      result.current.onInit(3)
    })

    const updatedStepEnd: ImageGenerationStepEndResponse = {
      index: 1,
      current_step: 15,
      timestep: 500,
      image_base64: 'base64-encoded-image-data'
    }

    act(() => {
      result.current.onUpdateImageStepEnd(updatedStepEnd)
    })

    expect(result.current.imageStepEnds[1]).toEqual(updatedStepEnd)
    // Other indices should remain unchanged
    expect(result.current.imageStepEnds[0]).toEqual(
      onCreateDefaultImageStepEnd(0)
    )
    expect(result.current.imageStepEnds[2]).toEqual(
      onCreateDefaultImageStepEnd(2)
    )
  })

  it('should handle multiple updates to the same index', () => {
    const { result } = renderHook(() => useUseImageGenerationStore())

    act(() => {
      result.current.onInit(2)
    })

    const firstUpdate: ImageGenerationStepEndResponse = {
      index: 0,
      current_step: 5,
      timestep: 100,
      image_base64: 'first-update'
    }

    const secondUpdate: ImageGenerationStepEndResponse = {
      index: 0,
      current_step: 10,
      timestep: 200,
      image_base64: 'second-update'
    }

    act(() => {
      result.current.onUpdateImageStepEnd(firstUpdate)
    })

    expect(result.current.imageStepEnds[0]).toEqual(firstUpdate)

    act(() => {
      result.current.onUpdateImageStepEnd(secondUpdate)
    })

    expect(result.current.imageStepEnds[0]).toEqual(secondUpdate)
  })
})

describe('useUseImageGenerationStore - onRestore', () => {
  it('should restore state from history generated images', () => {
    const { result } = renderHook(() => useUseImageGenerationStore())

    const mockHistoryImages: HistoryGeneratedImage[] = [
      {
        id: 1,
        path: '/history/image1.png',
        file_name: 'image1.png',
        is_nsfw: false,
        updated_at: '2023-01-01T00:00:00Z',
        history_id: 100,
        created_at: '2023-01-01T00:00:00Z'
      },
      {
        id: 2,
        path: '/history/image2.png',
        file_name: 'image2.png',
        is_nsfw: true,
        updated_at: '2023-01-01T00:00:00Z',
        history_id: 100,
        created_at: '2023-01-01T00:00:00Z'
      }
    ]

    act(() => {
      result.current.onRestore(mockHistoryImages)
    })

    expect(result.current.items).toEqual([
      { path: '/history/image1.png', file_name: 'image1.png' },
      { path: '/history/image2.png', file_name: 'image2.png' }
    ])

    expect(result.current.nsfw_content_detected).toEqual([false, true])

    expect(result.current.imageStepEnds).toHaveLength(2)
    expect(result.current.imageStepEnds[0]).toEqual({
      index: 0,
      current_step: 0,
      timestep: 0,
      image_base64: ''
    })
    expect(result.current.imageStepEnds[1]).toEqual({
      index: 1,
      current_step: 0,
      timestep: 0,
      image_base64: ''
    })
  })

  it('should handle empty history images', () => {
    const { result } = renderHook(() => useUseImageGenerationStore())

    act(() => {
      result.current.onRestore([])
    })

    expect(result.current.items).toEqual([])
    expect(result.current.nsfw_content_detected).toEqual([])
    expect(result.current.imageStepEnds).toEqual([])
  })

  it('should replace existing state when restoring', () => {
    const { result } = renderHook(() => useUseImageGenerationStore())

    // Initialize with some data first
    act(() => {
      result.current.onInit(3)
    })

    expect(result.current.items).toHaveLength(3)

    const mockHistoryImages: HistoryGeneratedImage[] = [
      {
        id: 1,
        path: '/restored/image.png',
        file_name: 'restored.png',
        is_nsfw: false,
        updated_at: '2023-01-01T00:00:00Z',
        history_id: 200,
        created_at: '2023-01-01T00:00:00Z'
      }
    ]

    act(() => {
      result.current.onRestore(mockHistoryImages)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0]).toEqual({
      path: '/restored/image.png',
      file_name: 'restored.png'
    })
  })
})

describe('useUseImageGenerationStore - integration', () => {
  it('should work correctly with multiple method calls in sequence', () => {
    const { result } = renderHook(() => useUseImageGenerationStore())

    // Initialize
    act(() => {
      result.current.onInit(2)
    })

    // Update a step end
    const stepUpdate: ImageGenerationStepEndResponse = {
      index: 0,
      current_step: 10,
      timestep: 300,
      image_base64: 'updated-image'
    }

    act(() => {
      result.current.onUpdateImageStepEnd(stepUpdate)
    })

    // Complete generation
    const completion: ImageGenerationResponse = {
      items: [
        { path: '/final/image1.png', file_name: 'final1.png' },
        { path: '/final/image2.png', file_name: 'final2.png' }
      ],
      nsfw_content_detected: [false, false]
    }

    act(() => {
      result.current.onCompleted(completion)
    })

    expect(result.current.items).toEqual(completion.items)
    expect(result.current.nsfw_content_detected).toEqual(
      completion.nsfw_content_detected
    )
    expect(result.current.imageStepEnds[0]).toEqual(stepUpdate)
    expect(result.current.imageStepEnds[1]).toEqual(
      onCreateDefaultImageStepEnd(1)
    )
  })
})
