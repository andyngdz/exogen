import {
  useFormValuesStore,
  useUseImageGenerationStore
} from '@/features/generators'
import { HistoryItem } from '@/types'
import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useUseConfig } from '../useUseConfig'

// Mock the imported stores
vi.mock('@/features/generators', () => ({
  useFormValuesStore: vi.fn(),
  useUseImageGenerationStore: vi.fn()
}))

describe('useUseConfig', () => {
  const mockOnSetValues = vi.fn()
  const mockOnRestore = vi.fn()

  beforeEach(() => {
    vi.mocked(useFormValuesStore).mockReturnValue({
      onSetValues: mockOnSetValues
    })

    vi.mocked(useUseImageGenerationStore).mockReturnValue({
      onRestore: mockOnRestore
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return onUseConfig function', () => {
    const mockHistory: HistoryItem = {
      id: 1,
      model: 'test-model',
      prompt: 'test prompt',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      config: {
        width: 512,
        height: 512,

        loras: [],
        number_of_images: 1,
        prompt: 'test prompt',
        negative_prompt: '',
        cfg_scale: 7,
        clip_skip: 2,
        steps: 20,
        seed: -1,
        sampler: 'Euler a',
        styles: []
      },
      generated_images: [
        {
          id: 1,
          path: '/path/to/image.png',
          is_nsfw: false,
          file_name: 'image.png',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          history_id: 1
        }
      ]
    }

    const { result } = renderHook(() => useUseConfig(mockHistory))

    expect(result.current).toHaveProperty('onUseConfig')
    expect(typeof result.current.onUseConfig).toBe('function')
  })

  it('should call onSetValues with history config and onRestore with generated images when onUseConfig is called', () => {
    const mockHistory: HistoryItem = {
      id: 1,
      model: 'test-model',
      prompt: 'test prompt',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      config: {
        width: 512,
        height: 512,

        loras: [],
        number_of_images: 1,
        prompt: 'test prompt',
        negative_prompt: '',
        cfg_scale: 7,
        clip_skip: 2,
        steps: 20,
        seed: -1,
        sampler: 'Euler a',
        styles: []
      },
      generated_images: [
        {
          id: 1,
          path: '/path/to/image.png',
          is_nsfw: false,
          file_name: 'image.png',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          history_id: 1
        }
      ]
    }

    const { result } = renderHook(() => useUseConfig(mockHistory))

    // Call the onUseConfig function
    result.current.onUseConfig()

    // Verify that the store functions were called with the correct arguments
    expect(mockOnSetValues).toHaveBeenCalledWith(mockHistory.config)
    expect(mockOnRestore).toHaveBeenCalledWith(mockHistory.generated_images)
  })
})
