import { afterEach, describe, expect, it } from 'vitest'
import { ModelFamily } from '@/types'
import { useModelSelectorStore } from '../useModelSelectorStores'

describe('useModelSelectorStore', () => {
  // Clear the store after each test
  afterEach(() => {
    useModelSelectorStore.setState({
      selected_model_id: '',
      loaded_model_family: ModelFamily.UNKNOWN
    })
  })

  it('should initialize with empty selected_model_id', () => {
    const state = useModelSelectorStore.getState()
    expect(state.selected_model_id).toBe('')
  })

  it('should initialize with unknown loaded_model_family', () => {
    const state = useModelSelectorStore.getState()
    expect(state.loaded_model_family).toBe(ModelFamily.UNKNOWN)
  })

  it('should update selected_model_id when setSelectedModelId is called', () => {
    const state = useModelSelectorStore.getState()
    state.setSelectedModelId('test-model-id')

    const updatedState = useModelSelectorStore.getState()
    expect(updatedState.selected_model_id).toBe('test-model-id')
  })

  it('should update loaded_model_family when setLoadedModelFamily is called', () => {
    const state = useModelSelectorStore.getState()
    state.setLoadedModelFamily(ModelFamily.SDXL)

    const updatedState = useModelSelectorStore.getState()
    expect(updatedState.loaded_model_family).toBe(ModelFamily.SDXL)
  })

  it('should persist the state with proper name', () => {
    // This verifies that the persist middleware is configured correctly

    // Get the persist options from the store
    const persistOptions = useModelSelectorStore.persist?.getOptions()

    expect(persistOptions).toBeDefined()
    expect(persistOptions?.name).toBe('model-selector')
  })

  it('should only persist selected_model_id via partialize', () => {
    const persistOptions = useModelSelectorStore.persist?.getOptions()
    expect(persistOptions).toBeDefined()

    useModelSelectorStore.setState({
      selected_model_id: 'test-model-id',
      loaded_model_family: ModelFamily.SD3
    })

    const state = useModelSelectorStore.getState()
    const partial = persistOptions?.partialize?.(state)

    expect(partial).toEqual({ selected_model_id: 'test-model-id' })
  })
})
