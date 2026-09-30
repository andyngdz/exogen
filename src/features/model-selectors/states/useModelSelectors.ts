import { api } from '@/services'
import { ModelFamily } from '@/types'
import { isEmpty } from 'es-toolkit/compat'
import { useCallback, useEffect, useRef } from 'react'
import { useModelSelectorStore } from './useModelSelectorStores'

export const useModelSelectors = () => {
  const selectedModelId = useModelSelectorStore(
    (state) => state.selected_model_id
  )
  const setLoadedModelFamily = useModelSelectorStore(
    (state) => state.setLoadedModelFamily
  )
  const previousModelIdRef = useRef('')

  const onInitLoadModel = useCallback(async () => {
    const previousModelId = previousModelIdRef.current
    previousModelIdRef.current = selectedModelId
    setLoadedModelFamily(ModelFamily.UNKNOWN)

    // The backend refuses to load over a loaded model, so free the old one first.
    // Never unload on unmount: a remount would kill a generation that is still running.
    if (!isEmpty(previousModelId) && previousModelId !== selectedModelId) {
      await api.unloadModel()
    }

    if (isEmpty(selectedModelId)) return

    const result = await api.loadModel({ model_id: selectedModelId })
    setLoadedModelFamily(result.family)
  }, [selectedModelId, setLoadedModelFamily])

  useEffect(() => {
    void onInitLoadModel()
  }, [onInitLoadModel])
}
