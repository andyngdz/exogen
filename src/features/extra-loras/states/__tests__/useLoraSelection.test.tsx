import { useLorasQuery } from '@/cores/api-queries'
import { createGeneratorConfigFormWrapper } from '@/cores/test-utils'
import type { GeneratorConfigFormValues } from '@/features/generator-configs'
import type { LoRA } from '@/types'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useLoraSelection } from '../useLoraSelection'

// Mock API queries
vi.mock('@/cores/api-queries', () => ({
  useLorasQuery: vi.fn()
}))

const mockLoras: LoRA[] = [
  {
    id: 1,
    name: 'Test LoRA 1',
    file_path: '/path/to/lora1.safetensors',
    file_size: 1024,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Test LoRA 2',
    file_path: '/path/to/lora2.safetensors',
    file_size: 2048,
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z'
  },
  {
    id: 3,
    name: 'Test LoRA 3',
    file_path: '/path/to/lora3.safetensors',
    file_size: 4096,
    created_at: '2025-01-03T00:00:00Z',
    updated_at: '2025-01-03T00:00:00Z'
  }
]

const createWrapper = (
  initialLoras: GeneratorConfigFormValues['loras'] = []
) => {
  return createGeneratorConfigFormWrapper({
    overrides: {
      loras: initialLoras
    }
  })
}

describe('useLoraSelection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useLorasQuery).mockReturnValue({
      data: mockLoras,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    } as unknown as ReturnType<typeof useLorasQuery>)
  })

  describe('addLora', () => {
    it('adds a new lora with default weight 1.0', () => {
      const Wrapper = createWrapper([])
      const { result } = renderHook(() => useLoraSelection(), {
        wrapper: Wrapper
      })

      act(() => {
        result.current.addLora(mockLoras[0])
      })

      expect(result.current.selectedLoras).toHaveLength(1)
      expect(result.current.selectedLoras[0].id).toBe(1)
    })

    it('does not add lora if it already exists', () => {
      const Wrapper = createWrapper([{ lora_id: 1, weight: 1 }])
      const { result } = renderHook(() => useLoraSelection(), {
        wrapper: Wrapper
      })

      act(() => {
        result.current.addLora(mockLoras[0])
      })

      expect(result.current.selectedLoras).toHaveLength(1)
    })

    it('can add multiple different loras', () => {
      const Wrapper = createWrapper([])
      const { result } = renderHook(() => useLoraSelection(), {
        wrapper: Wrapper
      })

      act(() => {
        result.current.addLora(mockLoras[0])
      })
      act(() => {
        result.current.addLora(mockLoras[1])
      })

      expect(result.current.selectedLoras).toHaveLength(2)
      expect(result.current.selectedLoras[0].id).toBe(1)
      expect(result.current.selectedLoras[1].id).toBe(2)
    })
  })

  describe('removeLora', () => {
    it('removes a lora by id', () => {
      const Wrapper = createWrapper([
        { lora_id: 1, weight: 1 },
        { lora_id: 2, weight: 1 }
      ])
      const { result } = renderHook(() => useLoraSelection(), {
        wrapper: Wrapper
      })

      act(() => {
        result.current.removeLora(1)
      })

      expect(result.current.selectedLoras).toHaveLength(1)
      expect(result.current.selectedLoras[0].id).toBe(2)
    })

    it('does nothing if lora id does not exist', () => {
      const Wrapper = createWrapper([{ lora_id: 1, weight: 1 }])
      const { result } = renderHook(() => useLoraSelection(), {
        wrapper: Wrapper
      })

      act(() => {
        result.current.removeLora(999)
      })

      expect(result.current.selectedLoras).toHaveLength(1)
    })

    it('can remove all loras', () => {
      const Wrapper = createWrapper([
        { lora_id: 1, weight: 1 },
        { lora_id: 2, weight: 1 }
      ])
      const { result } = renderHook(() => useLoraSelection(), {
        wrapper: Wrapper
      })

      act(() => {
        result.current.removeLora(1)
      })
      act(() => {
        result.current.removeLora(2)
      })

      expect(result.current.selectedLoras).toHaveLength(0)
    })
  })

  describe('toggleLora', () => {
    it('adds lora if it does not exist', () => {
      const Wrapper = createWrapper([])
      const { result } = renderHook(() => useLoraSelection(), {
        wrapper: Wrapper
      })

      act(() => {
        result.current.toggleLora(mockLoras[0])
      })

      expect(result.current.selectedLoras).toHaveLength(1)
      expect(result.current.selectedLoras[0].id).toBe(1)
    })

    it('removes lora if it exists', () => {
      const Wrapper = createWrapper([{ lora_id: 1, weight: 1 }])
      const { result } = renderHook(() => useLoraSelection(), {
        wrapper: Wrapper
      })

      act(() => {
        result.current.toggleLora(mockLoras[0])
      })

      expect(result.current.selectedLoras).toHaveLength(0)
    })

    it('can toggle lora on and off multiple times', () => {
      const Wrapper = createWrapper([])
      const { result } = renderHook(() => useLoraSelection(), {
        wrapper: Wrapper
      })

      act(() => {
        result.current.toggleLora(mockLoras[0])
      })
      expect(result.current.selectedLoras).toHaveLength(1)

      act(() => {
        result.current.toggleLora(mockLoras[0])
      })
      expect(result.current.selectedLoras).toHaveLength(0)

      act(() => {
        result.current.toggleLora(mockLoras[0])
      })
      expect(result.current.selectedLoras).toHaveLength(1)
    })
  })

  describe('selectedLoras', () => {
    it('returns empty array when no loras are selected', () => {
      const Wrapper = createWrapper([])
      const { result } = renderHook(() => useLoraSelection(), {
        wrapper: Wrapper
      })

      expect(result.current.selectedLoras).toEqual([])
    })

    it('returns empty array when data is undefined', () => {
      vi.mocked(useLorasQuery).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        refetch: vi.fn()
      } as unknown as ReturnType<typeof useLorasQuery>)

      const Wrapper = createWrapper([{ lora_id: 1, weight: 1 }])
      const { result } = renderHook(() => useLoraSelection(), {
        wrapper: Wrapper
      })

      expect(result.current.selectedLoras).toEqual([])
    })

    it('returns selected loras with full details from data', () => {
      const Wrapper = createWrapper([
        { lora_id: 1, weight: 1 },
        { lora_id: 3, weight: 1.5 }
      ])
      const { result } = renderHook(() => useLoraSelection(), {
        wrapper: Wrapper
      })

      expect(result.current.selectedLoras).toHaveLength(2)
      expect(result.current.selectedLoras[0]).toEqual(mockLoras[0])
      expect(result.current.selectedLoras[1]).toEqual(mockLoras[2])
    })

    it('filters out loras that no longer exist in data', () => {
      const Wrapper = createWrapper([
        { lora_id: 1, weight: 1 },
        { lora_id: 999, weight: 1 }
      ])
      const { result } = renderHook(() => useLoraSelection(), {
        wrapper: Wrapper
      })

      expect(result.current.selectedLoras).toHaveLength(1)
      expect(result.current.selectedLoras[0].id).toBe(1)
    })

    it('maintains order of selected loras', () => {
      const Wrapper = createWrapper([
        { lora_id: 3, weight: 1 },
        { lora_id: 1, weight: 1 },
        { lora_id: 2, weight: 1 }
      ])
      const { result } = renderHook(() => useLoraSelection(), {
        wrapper: Wrapper
      })

      expect(result.current.selectedLoras).toHaveLength(3)
      expect(result.current.selectedLoras[0].id).toBe(3)
      expect(result.current.selectedLoras[1].id).toBe(1)
      expect(result.current.selectedLoras[2].id).toBe(2)
    })
  })
})
