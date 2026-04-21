import { dateFormatter } from '@/services'
import { HistoryItem } from '@/types'
import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useHistoryGroups } from '../useHistoryGroups'

vi.mock('@/services', () => ({
  dateFormatter: {
    date: vi.fn()
  }
}))

const createMockHistoryItem = (id: number, createdAt: string): HistoryItem => ({
  id,
  created_at: createdAt,
  prompt: `prompt ${id}`,
  model: `model ${id}`,
  updated_at: createdAt,
  config: {
    width: 512,
    height: 512,

    loras: [],
    number_of_images: 1,
    prompt: `prompt ${id}`,
    negative_prompt: '',
    cfg_scale: 7,
    clip_skip: 2,
    steps: 20,
    seed: -1,
    sampler: 'Euler a',
    styles: []
  },
  generated_images: []
})

describe('useHistoryGroups', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return an empty array when histories is empty', () => {
    const { result } = renderHook(() => useHistoryGroups([]))
    expect(result.current).toEqual([])
  })

  it('should group histories by date and reverse their order', () => {
    const histories: HistoryItem[] = [
      createMockHistoryItem(1, '2023-01-01T10:00:00Z'),
      createMockHistoryItem(2, '2023-01-01T11:00:00Z')
    ]

    vi.mocked(dateFormatter.date).mockReturnValue('January 1, 2023')

    const { result } = renderHook(() => useHistoryGroups(histories))

    expect(result.current).toHaveLength(1)
    expect(result.current[0].date).toBe('January 1, 2023')
    expect(result.current[0].histories).toHaveLength(2)
    expect(result.current[0].histories[0].id).toBe(2)
    expect(result.current[0].histories[1].id).toBe(1)
  })

  it('should group histories into multiple date groups', () => {
    const histories: HistoryItem[] = [
      createMockHistoryItem(1, '2023-01-01T10:00:00Z'),
      createMockHistoryItem(2, '2023-01-02T11:00:00Z'),
      createMockHistoryItem(3, '2023-01-01T12:00:00Z')
    ]

    vi.mocked(dateFormatter.date).mockImplementation((dateStr) => {
      if (typeof dateStr !== 'string') return 'Unknown Date'
      if (dateStr.startsWith('2023-01-01')) return 'January 1, 2023'
      if (dateStr.startsWith('2023-01-02')) return 'January 2, 2023'
      return 'Unknown Date'
    })

    const { result } = renderHook(() => useHistoryGroups(histories))

    expect(result.current).toHaveLength(2)

    const group2 = result.current.find((g) => g.date === 'January 2, 2023')
    const group1 = result.current.find((g) => g.date === 'January 1, 2023')

    expect(group1).toBeDefined()
    expect(group2).toBeDefined()

    expect(group1?.histories).toHaveLength(2)
    expect(group1?.histories[0].id).toBe(3)
    expect(group1?.histories[1].id).toBe(1)

    expect(group2?.histories).toHaveLength(1)
    expect(group2?.histories[0].id).toBe(2)
  })

  it('should maintain the reversed order of histories within a single group', () => {
    const histories: HistoryItem[] = [
      createMockHistoryItem(1, '2023-01-01T10:00:00Z'),
      createMockHistoryItem(2, '2023-01-01T11:00:00Z'),
      createMockHistoryItem(3, '2023-01-01T09:00:00Z')
    ]

    vi.mocked(dateFormatter.date).mockReturnValue('January 1, 2023')

    const { result } = renderHook(() => useHistoryGroups(histories))

    expect(result.current[0].histories[0].id).toBe(3)
    expect(result.current[0].histories[1].id).toBe(2)
    expect(result.current[0].histories[2].id).toBe(1)
  })
})
