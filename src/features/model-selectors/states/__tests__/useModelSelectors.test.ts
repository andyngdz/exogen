import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useModelSelectors } from '../useModelSelectors'
import { useModelSelectorStore } from '../useModelSelectorStores'
import { ModelFamily } from '@/types'

// Mock dependencies
vi.mock('@/services/api', () => ({
  api: {
    loadModel: vi.fn(),
    unloadModel: vi.fn()
  }
}))

vi.mock('../useModelSelectorStores', () => ({
  useModelSelectorStore: vi.fn()
}))

// Mock es-toolkit isEmpty function
vi.mock('es-toolkit/compat', () => ({
  isEmpty: (value: string) => value === ''
}))

describe('useModelSelectors', () => {
  const setLoadedModelFamily = vi.fn()

  beforeEach(async () => {
    vi.clearAllMocks()

    const mockedApi = vi.mocked(await import('@/services/api')).api
    vi.mocked(mockedApi.loadModel).mockResolvedValue({
      model_id: 'model-id',
      config: {},
      sample_size: 64,
      family: ModelFamily.UNKNOWN
    })
    vi.mocked(mockedApi.unloadModel).mockResolvedValue({})

    vi.mocked(useModelSelectorStore).mockReturnValue({
      selected_model_id: '',
      loaded_model_family: ModelFamily.UNKNOWN,
      setSelectedModelId: vi.fn(),
      setLoadedModelFamily
    })
  })

  it('should not load model when selected_model_id is empty', async () => {
    const mockedApi = vi.mocked(await import('@/services/api')).api
    vi.mocked(useModelSelectorStore).mockReturnValue({
      selected_model_id: '',
      loaded_model_family: ModelFamily.UNKNOWN,
      setSelectedModelId: vi.fn(),
      setLoadedModelFamily
    })

    renderHook(() => useModelSelectors())

    await waitFor(() => {
      expect(setLoadedModelFamily).toHaveBeenCalledWith(ModelFamily.UNKNOWN)
    })

    expect(mockedApi.loadModel).not.toHaveBeenCalled()
  })

  it('should load model when selected_model_id exists', async () => {
    const mockedApi = vi.mocked(await import('@/services/api')).api
    vi.mocked(mockedApi.loadModel).mockResolvedValueOnce({
      model_id: 'model-id',
      config: {},
      sample_size: 64,
      family: ModelFamily.SDXL
    })
    vi.mocked(useModelSelectorStore).mockReturnValue({
      selected_model_id: 'llama-3',
      loaded_model_family: ModelFamily.UNKNOWN,
      setSelectedModelId: vi.fn(),
      setLoadedModelFamily
    })

    renderHook(() => useModelSelectors())

    // Should call loadModel with the selected model id
    await waitFor(() => {
      expect(mockedApi.loadModel).toHaveBeenCalledWith({ model_id: 'llama-3' })
    })

    await waitFor(() => {
      expect(setLoadedModelFamily).toHaveBeenCalledWith(ModelFamily.SDXL)
    })
  })

  it('should unload model on unmount', async () => {
    const mockedApi = vi.mocked(await import('@/services/api')).api
    vi.mocked(useModelSelectorStore).mockReturnValue({
      selected_model_id: 'llama-3',
      loaded_model_family: ModelFamily.UNKNOWN,
      setSelectedModelId: vi.fn(),
      setLoadedModelFamily
    })

    const { unmount } = renderHook(() => useModelSelectors())
    unmount()

    await waitFor(() => {
      expect(mockedApi.unloadModel).toHaveBeenCalled()
    })
  })

  it('should reload model when selected_model_id changes', async () => {
    const mockedApi = vi.mocked(await import('@/services/api')).api
    vi.mocked(mockedApi.loadModel)
      .mockResolvedValueOnce({
        model_id: 'model-id',
        config: {},
        sample_size: 64,
        family: ModelFamily.SD15
      })
      .mockResolvedValueOnce({
        model_id: 'model-id',
        config: {},
        sample_size: 64,
        family: ModelFamily.FLUX
      })

    // Start with first model
    vi.mocked(useModelSelectorStore).mockReturnValue({
      selected_model_id: 'llama-3',
      loaded_model_family: ModelFamily.UNKNOWN,
      setSelectedModelId: vi.fn(),
      setLoadedModelFamily
    })
    const { rerender } = renderHook(() => useModelSelectors())

    await waitFor(() => {
      expect(mockedApi.loadModel).toHaveBeenCalledWith({ model_id: 'llama-3' })
    })

    await waitFor(() => {
      expect(setLoadedModelFamily).toHaveBeenCalledWith(ModelFamily.SD15)
    })

    // Change to second model
    vi.mocked(useModelSelectorStore).mockReturnValue({
      selected_model_id: 'codellama',
      loaded_model_family: ModelFamily.UNKNOWN,
      setSelectedModelId: vi.fn(),
      setLoadedModelFamily
    })
    rerender()

    await waitFor(() => {
      expect(mockedApi.loadModel).toHaveBeenCalledWith({
        model_id: 'codellama'
      })
    })

    await waitFor(() => {
      expect(setLoadedModelFamily).toHaveBeenCalledWith(ModelFamily.FLUX)
    })
  })
})
