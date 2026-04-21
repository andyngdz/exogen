import { createQueryClientWrapper } from '@/cores/test-utils/query-client'
import { api } from '@/services/api'
import { addToast } from '@heroui/react'
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDeleteHistory } from '../useDeleteHistory'

vi.mock('@/services/api', () => ({
  api: {
    deleteHistory: vi.fn()
  }
}))

vi.mock('@heroui/react', () => ({
  addToast: vi.fn()
}))

describe('useDeleteHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.deleteHistory).mockResolvedValue({ success: true })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('mutation initialization', () => {
    it('should create a mutation that can be called', () => {
      const { result } = renderHook(() => useDeleteHistory(), {
        wrapper: createQueryClientWrapper()
      })

      expect(result.current.mutate).toBeDefined()
      expect(result.current.mutateAsync).toBeDefined()
      expect(result.current.isPending).toBe(false)
    })
  })

  describe('mutationFn', () => {
    it('should call api.deleteHistory with the provided id', async () => {
      const { result } = renderHook(() => useDeleteHistory(), {
        wrapper: createQueryClientWrapper()
      })

      await result.current.mutateAsync(123)

      expect(api.deleteHistory).toHaveBeenCalledWith(123)
    })
  })

  describe('onSuccess callback', () => {
    it('should show a success toast when deletion succeeds', async () => {
      const { result } = renderHook(() => useDeleteHistory(), {
        wrapper: createQueryClientWrapper()
      })

      await result.current.mutateAsync(123)

      expect(addToast).toHaveBeenCalledWith({
        title: 'History deleted',
        description: 'The history entry was removed successfully.',
        color: 'success'
      })
    })

    it('should call onSuccess callback after successful deletion', async () => {
      const { result } = renderHook(() => useDeleteHistory(), {
        wrapper: createQueryClientWrapper()
      })

      await result.current.mutateAsync(123)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(addToast).toHaveBeenCalledWith({
        title: 'History deleted',
        description: 'The history entry was removed successfully.',
        color: 'success'
      })
    })
  })

  describe('onError callback', () => {
    it('should show an error toast when deletion fails', async () => {
      const errorMessage = 'Failed to delete history'
      vi.mocked(api.deleteHistory).mockRejectedValueOnce(
        new Error(errorMessage)
      )

      const { result } = renderHook(() => useDeleteHistory(), {
        wrapper: createQueryClientWrapper()
      })

      await expect(result.current.mutateAsync(123)).rejects.toThrow(
        errorMessage
      )

      expect(addToast).toHaveBeenCalledWith({
        title: 'Delete failed',
        description: errorMessage,
        color: 'danger'
      })
    })

    it('should handle mutation error state when deletion fails', async () => {
      vi.mocked(api.deleteHistory).mockRejectedValueOnce(new Error('API error'))

      const { result } = renderHook(() => useDeleteHistory(), {
        wrapper: createQueryClientWrapper()
      })

      await expect(result.current.mutateAsync(123)).rejects.toThrow()

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.isSuccess).toBe(false)
    })
  })
})
