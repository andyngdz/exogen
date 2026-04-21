import { useModelRecommendationsQuery } from '@/cores/api-queries'
import { SocketEvents } from '@/cores/sockets'
import { act, renderHook } from '@testing-library/react'
import { setupRouterMock } from '@/cores/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useModelRecommendation } from '../useModelRecommendation'

vi.mock('@/cores/api-queries')

// Mock useSocketEvent to capture handlers
let capturedHandlers: Record<string, (data: unknown) => void> = {}

vi.mock('@/cores/sockets', async () => {
  const actual = await vi.importActual('@/cores/sockets')
  return {
    ...actual,
    useSocketEvent: vi.fn((event: string, handler: (data: unknown) => void) => {
      capturedHandlers[event] = handler
    })
  }
})

vi.mock('next/navigation', () => ({ useRouter: vi.fn() }))

describe('useModelRecommendation', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    capturedHandlers = {}
    await setupRouterMock()
  })

  it('should return data from query', () => {
    const mockData = { default_selected_id: 'test-id' }
    vi.mocked(useModelRecommendationsQuery).mockReturnValue({
      data: mockData
    } as ReturnType<typeof useModelRecommendationsQuery>)

    const { result } = renderHook(() => useModelRecommendation())

    expect(result.current.data).toEqual(mockData)
  })

  it('should subscribe to DOWNLOAD_COMPLETED event', async () => {
    vi.mocked(useModelRecommendationsQuery).mockReturnValue({
      data: {}
    } as ReturnType<typeof useModelRecommendationsQuery>)

    const { useSocketEvent } = vi.mocked(await import('@/cores/sockets'))
    renderHook(() => useModelRecommendation())

    expect(useSocketEvent).toHaveBeenCalledWith(
      SocketEvents.DOWNLOAD_COMPLETED,
      expect.any(Function),
      expect.any(Array)
    )
  })

  it('should navigate to editor on DOWNLOAD_COMPLETED', async () => {
    vi.mocked(useModelRecommendationsQuery).mockReturnValue({
      data: {}
    } as ReturnType<typeof useModelRecommendationsQuery>)

    const { mockReplace } = await setupRouterMock()

    renderHook(() => useModelRecommendation())

    // Simulate DOWNLOAD_COMPLETED event
    act(() => {
      capturedHandlers[SocketEvents.DOWNLOAD_COMPLETED](undefined)
    })

    expect(mockReplace).toHaveBeenCalledWith('/editor')
  })

  it('should navigate to editor when onNext is called', async () => {
    vi.mocked(useModelRecommendationsQuery).mockReturnValue({
      data: {}
    } as ReturnType<typeof useModelRecommendationsQuery>)

    const { mockReplace } = await setupRouterMock()

    const { result } = renderHook(() => useModelRecommendation())

    await act(async () => {
      result.current.onNext()
    })

    expect(mockReplace).toHaveBeenCalledWith('/editor')
  })

  it('should navigate to editor when onSkip is called', async () => {
    vi.mocked(useModelRecommendationsQuery).mockReturnValue({
      data: {}
    } as ReturnType<typeof useModelRecommendationsQuery>)

    const { mockReplace } = await setupRouterMock()

    const { result } = renderHook(() => useModelRecommendation())

    await act(async () => {
      result.current.onSkip()
    })

    expect(mockReplace).toHaveBeenCalledWith('/editor')
  })
})
