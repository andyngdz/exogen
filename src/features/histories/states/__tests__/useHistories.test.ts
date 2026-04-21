import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useHistories } from '../useHistories'
import { useHistoriesQuery } from '@/cores/api-queries'
import { useHistoryGroups } from '../useHistoryGroups'
import type { HistoryGroup } from '../useHistoryGroups'
import { createQueryClientWrapper } from '@/cores/test-utils/query-client'
import { createMockQueryResult } from '@/cores/test-utils/query-result-mock'
import type { HistoryItem } from '@/types'
import type { ApiError } from '@/types/api'

vi.mock('@/cores/api-queries', () => ({
  useHistoriesQuery: vi.fn()
}))

vi.mock('../useHistoryGroups', () => ({
  useHistoryGroups: vi.fn()
}))

describe('useHistories', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns historyGroups computed from query data', () => {
    const histories: HistoryItem[] = [
      {
        id: 1,
        model: 'model-1',
        prompt: 'hello',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        config: {
          width: 512,
          height: 512,

          loras: [],
          number_of_images: 1,
          prompt: 'hello',
          negative_prompt: '',
          cfg_scale: 7,
          clip_skip: 2,
          steps: 20,
          seed: 0,
          sampler: 'Euler',
          styles: []
        },
        generated_images: []
      }
    ]

    const groups: HistoryGroup[] = [{ date: '2023-01-01', histories }]

    vi.mocked(useHistoriesQuery).mockReturnValue(
      createMockQueryResult(histories, { isLoading: false, error: null })
    )
    vi.mocked(useHistoryGroups).mockReturnValue(groups)

    const { result } = renderHook(() => useHistories(), {
      wrapper: createQueryClientWrapper()
    })

    expect(useHistoryGroups).toHaveBeenCalledWith(histories)
    expect(result.current.historyGroups).toEqual(groups)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('defaults to empty list when query data is undefined', () => {
    vi.mocked(useHistoriesQuery).mockReturnValue(
      createMockQueryResult<HistoryItem[]>(undefined)
    )
    vi.mocked(useHistoryGroups).mockReturnValue([])

    const { result } = renderHook(() => useHistories(), {
      wrapper: createQueryClientWrapper()
    })

    expect(useHistoryGroups).toHaveBeenCalledWith([])
    expect(result.current.historyGroups).toEqual([])
  })

  it('passes through loading and error states', () => {
    const error: ApiError = { message: 'Something went wrong', status: 500 }
    const mockQuery = createMockQueryResult<HistoryItem[]>(undefined, {
      isLoading: true,
      error
    })

    vi.mocked(useHistoriesQuery).mockReturnValue(mockQuery)
    vi.mocked(useHistoryGroups).mockReturnValue([])

    const { result } = renderHook(() => useHistories(), {
      wrapper: createQueryClientWrapper()
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toEqual(error)
  })
})
