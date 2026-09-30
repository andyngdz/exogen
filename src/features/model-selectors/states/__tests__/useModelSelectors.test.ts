import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useModelSelectors } from '../useModelSelectors'
import { useModelSelectorStore } from '../useModelSelectorStores'
import { ModelFamily } from '@/types'

vi.mock('@/services/api', () => ({
  api: {
    loadModel: vi.fn(),
    unloadModel: vi.fn()
  }
}))

const loadResponse = (family: ModelFamily) => ({
  model_id: 'model-id',
  config: {},
  sample_size: 64,
  family
})

const selectModel = (modelId: string) => {
  act(() => {
    useModelSelectorStore.getState().setSelectedModelId(modelId)
  })
}

describe('useModelSelectors', () => {
  beforeEach(async () => {
    vi.clearAllMocks()

    const mockedApi = vi.mocked(await import('@/services/api')).api
    vi.mocked(mockedApi.loadModel).mockResolvedValue(
      loadResponse(ModelFamily.UNKNOWN)
    )
    vi.mocked(mockedApi.unloadModel).mockResolvedValue({})

    useModelSelectorStore.setState({
      selected_model_id: '',
      loaded_model_family: ModelFamily.UNKNOWN
    })
  })

  it('should not load model when selected_model_id is empty', async () => {
    const mockedApi = vi.mocked(await import('@/services/api')).api

    renderHook(() => useModelSelectors())

    await waitFor(() => {
      expect(useModelSelectorStore.getState().loaded_model_family).toBe(
        ModelFamily.UNKNOWN
      )
    })

    expect(mockedApi.loadModel).not.toHaveBeenCalled()
    expect(mockedApi.unloadModel).not.toHaveBeenCalled()
  })

  it('should load model when selected_model_id exists', async () => {
    const mockedApi = vi.mocked(await import('@/services/api')).api
    vi.mocked(mockedApi.loadModel).mockResolvedValueOnce(
      loadResponse(ModelFamily.SDXL)
    )
    selectModel('llama-3')

    renderHook(() => useModelSelectors())

    await waitFor(() => {
      expect(useModelSelectorStore.getState().loaded_model_family).toBe(
        ModelFamily.SDXL
      )
    })

    expect(mockedApi.loadModel).toHaveBeenCalledWith({ model_id: 'llama-3' })
    expect(mockedApi.unloadModel).not.toHaveBeenCalled()
  })

  it('should keep the model loaded when the selector unmounts and remounts', async () => {
    const mockedApi = vi.mocked(await import('@/services/api')).api
    vi.mocked(mockedApi.loadModel).mockResolvedValue(
      loadResponse(ModelFamily.SD15)
    )
    selectModel('llama-3')

    const { unmount } = renderHook(() => useModelSelectors())
    await waitFor(() => {
      expect(mockedApi.loadModel).toHaveBeenCalledTimes(1)
    })

    unmount()
    renderHook(() => useModelSelectors())

    await waitFor(() => {
      expect(mockedApi.loadModel).toHaveBeenCalledTimes(2)
    })
    await waitFor(() => {
      expect(useModelSelectorStore.getState().loaded_model_family).toBe(
        ModelFamily.SD15
      )
    })
    expect(mockedApi.loadModel).toHaveBeenLastCalledWith({
      model_id: 'llama-3'
    })
    expect(mockedApi.unloadModel).not.toHaveBeenCalled()
  })

  it('should unload the previous model before loading a newly selected one', async () => {
    const mockedApi = vi.mocked(await import('@/services/api')).api
    vi.mocked(mockedApi.loadModel)
      .mockResolvedValueOnce(loadResponse(ModelFamily.SD15))
      .mockResolvedValueOnce(loadResponse(ModelFamily.FLUX))
    selectModel('llama-3')

    renderHook(() => useModelSelectors())

    await waitFor(() => {
      expect(useModelSelectorStore.getState().loaded_model_family).toBe(
        ModelFamily.SD15
      )
    })

    selectModel('codellama')

    await waitFor(() => {
      expect(useModelSelectorStore.getState().loaded_model_family).toBe(
        ModelFamily.FLUX
      )
    })

    expect(mockedApi.unloadModel).toHaveBeenCalledTimes(1)
    expect(
      vi.mocked(mockedApi.unloadModel).mock.invocationCallOrder[0]
    ).toBeLessThan(vi.mocked(mockedApi.loadModel).mock.invocationCallOrder[1])
    expect(mockedApi.loadModel).toHaveBeenLastCalledWith({
      model_id: 'codellama'
    })
  })
})
