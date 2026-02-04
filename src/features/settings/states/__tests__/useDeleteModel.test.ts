import { createQueryClientWrapper } from '@/cores/test-utils/query-client'
import { useModelSelectorStore } from '@/features/model-selectors/states/useModelSelectorStores'
import { api } from '@/services/api'
import { addToast } from '@heroui/react'
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDeleteModel } from '../useDeleteModel'
import { ModelFamily } from '@/types'

// Mock dependencies
vi.mock('@/features/model-selectors/states/useModelSelectorStores', () => ({
  useModelSelectorStore: vi.fn()
}))

vi.mock('@/services/api', () => ({
  api: {
    deleteModel: vi.fn()
  }
}))

vi.mock('@heroui/react', () => ({
  addToast: vi.fn()
}))

describe('useDeleteModel', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock useModelSelectorStore
    vi.mocked(useModelSelectorStore).mockReturnValue({
      selected_model_id: 'model-2',
      loaded_model_family: ModelFamily.UNKNOWN,
      setSelectedModelId: vi.fn(),
      setLoadedModelFamily: vi.fn()
    })

    // Mock successful API response by default
    vi.mocked(api.deleteModel).mockResolvedValue({ success: true })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('mutation initialization', () => {
    it('should create a mutation that can be called', () => {
      const { result } = renderHook(() => useDeleteModel(), {
        wrapper: createQueryClientWrapper()
      })

      expect(result.current.mutate).toBeDefined()
      expect(result.current.mutateAsync).toBeDefined()
      expect(result.current.isPending).toBe(false)
    })
  })

  describe('mutationFn', () => {
    it('should call api.deleteModel with the provided id', async () => {
      const { result } = renderHook(() => useDeleteModel(), {
        wrapper: createQueryClientWrapper()
      })

      await result.current.mutateAsync('model-1')

      expect(api.deleteModel).toHaveBeenCalledWith('model-1')
    })

    it('should throw an error when trying to delete the currently selected model', async () => {
      const { result } = renderHook(() => useDeleteModel(), {
        wrapper: createQueryClientWrapper()
      })

      // Try to delete the currently selected model
      await expect(result.current.mutateAsync('model-2')).rejects.toThrow(
        'The model is being used. Please unload before deleting'
      )

      // Verify API was not called
      expect(api.deleteModel).not.toHaveBeenCalled()
    })
  })

  describe('onSuccess callback', () => {
    it('should show a success toast when deletion succeeds', async () => {
      const { result } = renderHook(() => useDeleteModel(), {
        wrapper: createQueryClientWrapper()
      })

      await result.current.mutateAsync('model-1')

      expect(addToast).toHaveBeenCalledWith({
        title: 'Model deleted',
        description: 'The model was removed successfully.',
        color: 'success'
      })
    })

    it('should call onSuccess callback after successful deletion', async () => {
      const { result } = renderHook(() => useDeleteModel(), {
        wrapper: createQueryClientWrapper()
      })

      await result.current.mutateAsync('model-1')

      // Wait for mutation state to update
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(addToast).toHaveBeenCalledWith({
        title: 'Model deleted',
        description: 'The model was removed successfully.',
        color: 'success'
      })
    })
  })

  describe('onError callback', () => {
    it('should show an error toast when deletion fails', async () => {
      // Mock API to reject with an error
      const errorMessage = 'Failed to delete model'
      vi.mocked(api.deleteModel).mockRejectedValueOnce(new Error(errorMessage))

      const { result } = renderHook(() => useDeleteModel(), {
        wrapper: createQueryClientWrapper()
      })

      await expect(result.current.mutateAsync('model-1')).rejects.toThrow(
        errorMessage
      )

      expect(addToast).toHaveBeenCalledWith({
        title: 'Delete failed',
        description: errorMessage,
        color: 'danger'
      })
    })

    it('should handle mutation error state when deletion fails', async () => {
      // Mock API to reject with an error
      vi.mocked(api.deleteModel).mockRejectedValueOnce(new Error('API error'))

      const { result } = renderHook(() => useDeleteModel(), {
        wrapper: createQueryClientWrapper()
      })

      await expect(result.current.mutateAsync('model-1')).rejects.toThrow()

      // Wait for mutation state to update
      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.isSuccess).toBe(false)
    })
  })

  describe('integration scenarios', () => {
    it('should handle different model selection states', async () => {
      // Test with no selected model
      vi.mocked(useModelSelectorStore).mockReturnValueOnce({
        selected_model_id: undefined
      })

      const { result, rerender } = renderHook(() => useDeleteModel(), {
        wrapper: createQueryClientWrapper()
      })

      await result.current.mutateAsync('model-1')
      expect(api.deleteModel).toHaveBeenCalledWith('model-1')

      // Reset mocks
      vi.clearAllMocks()

      // Test with a different selected model
      vi.mocked(useModelSelectorStore).mockReturnValueOnce({
        selected_model_id: 'model-3'
      })

      rerender()

      await result.current.mutateAsync('model-1')
      expect(api.deleteModel).toHaveBeenCalledWith('model-1')

      // Reset mocks
      vi.clearAllMocks()

      // Test with the same model selected
      vi.mocked(useModelSelectorStore).mockReturnValueOnce({
        selected_model_id: 'model-1'
      })

      rerender()

      await expect(result.current.mutateAsync('model-1')).rejects.toThrow(
        'The model is being used. Please unload before deleting'
      )
      expect(api.deleteModel).not.toHaveBeenCalled()
    })
  })
})
