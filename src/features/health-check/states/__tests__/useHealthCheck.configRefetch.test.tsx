import { createQueryClientWrapper } from '@/cores/test-utils'
import { api } from '@/services'
import { BackendConfig } from '@/types'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useHealthCheck } from '../useHealthCheck'

const mockPush = vi.fn()
const health = vi.hoisted(() => ({ data: undefined as unknown }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush })
}))

vi.mock('@/cores/backend-initialization', () => ({
  useBackendInitStore: () => true
}))

vi.mock('@/cores/api-queries', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/cores/api-queries')>()),
  useHealthQuery: () => ({ data: health.data })
}))

const CONFIGURED: BackendConfig = {
  upscalers: [],
  safety_check_enabled: true,
  gpu_scale_factor: 0.5,
  ram_scale_factor: 0.5,
  total_gpu_memory: 12520062976,
  total_ram_memory: 33474428928,
  device_index: 0
}

describe('useHealthCheck with a backend that starts slowly', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    health.data = undefined
  })

  it('reloads the config once the backend is healthy and opens the editor', async () => {
    const getConfig = vi
      .spyOn(api, 'getConfig')
      .mockRejectedValueOnce(new Error('ERR_CONNECTION_REFUSED'))
      .mockResolvedValue(CONFIGURED)

    const { rerender } = renderHook(() => useHealthCheck(), {
      wrapper: createQueryClientWrapper()
    })

    await waitFor(() => expect(getConfig).toHaveBeenCalledTimes(1))
    expect(mockPush).not.toHaveBeenCalled()

    health.data = { status: 'healthy', message: 'Exogen Backend is running!' }
    rerender()

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/editor'))
  })
})
