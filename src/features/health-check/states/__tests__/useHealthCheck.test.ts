import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useHealthCheck } from '../useHealthCheck'

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}))

vi.mock('@/cores/api-queries', () => ({
  useHealthQuery: vi.fn()
}))

vi.mock('@/cores/backend-initialization', () => ({
  useBackendInitStore: vi.fn()
}))

vi.mock('@/cores/hooks', () => ({
  useConfig: vi.fn()
}))

describe('useHealthCheck', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper to setup all mocks
  const setupMocks = async (options: {
    isInitialized?: boolean
    isHealthy?: boolean
    isLoading?: boolean
    isHasDevice?: boolean
  }) => {
    const {
      isInitialized = true,
      isHealthy = false,
      isLoading = false,
      isHasDevice = false
    } = options

    const { useRouter } = await import('next/navigation')
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn()
    } as ReturnType<typeof useRouter>)

    const { useBackendInitStore } =
      await import('@/cores/backend-initialization')
    vi.mocked(useBackendInitStore).mockImplementation((selector) =>
      selector({
        isInitialized,
        baseURL: 'http://localhost:8000',
        setInitialized: vi.fn(),
        setBaseURL: vi.fn()
      })
    )

    const { useHealthQuery } = await import('@/cores/api-queries')
    vi.mocked(useHealthQuery).mockReturnValue({
      data: isHealthy ? { status: 'ok', message: 'Server is running' } : null
    } as ReturnType<typeof useHealthQuery>)

    const { useConfig } = await import('@/cores/hooks')
    vi.mocked(useConfig).mockReturnValue({
      isLoading,
      isHasDevice,
      upscalers: [],
      upscalerOptions: [],
      safety_check_enabled: true,
      gpu_scale_factor: 0.8,
      ram_scale_factor: 0.8,
      total_gpu_memory: 12485197824,
      total_ram_memory: 32943878144,
      device_index: isHasDevice ? 0 : -2
    })
  }

  it('returns isHealthy based on health query data', async () => {
    await setupMocks({ isHealthy: true, isLoading: false })

    const { result } = renderHook(() => useHealthCheck())

    expect(result.current.isHealthy).toBe(true)
  })

  it('returns isHealthy false when health query has no data', async () => {
    await setupMocks({ isHealthy: false })

    const { result } = renderHook(() => useHealthCheck())

    expect(result.current.isHealthy).toBe(false)
  })

  it('does not redirect when backend is not healthy', async () => {
    await setupMocks({ isHealthy: false, isLoading: false, isHasDevice: true })

    renderHook(() => useHealthCheck())

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('does not redirect while config is loading', async () => {
    await setupMocks({ isHealthy: true, isLoading: true, isHasDevice: true })

    renderHook(() => useHealthCheck())

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('redirects to /editor when healthy, config loaded, and device configured', async () => {
    await setupMocks({ isHealthy: true, isLoading: false, isHasDevice: true })

    renderHook(() => useHealthCheck())

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/editor')
    })
  })

  it('redirects to /gpu-detection when healthy, config loaded, and no device configured', async () => {
    await setupMocks({ isHealthy: true, isLoading: false, isHasDevice: false })

    renderHook(() => useHealthCheck())

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/gpu-detection')
    })
  })

  it('does not redirect when backend is not initialized', async () => {
    await setupMocks({
      isInitialized: false,
      isHealthy: false,
      isLoading: false,
      isHasDevice: true
    })

    renderHook(() => useHealthCheck())

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled()
    })
  })
})
