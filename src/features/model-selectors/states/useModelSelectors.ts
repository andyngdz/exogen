import { api } from '@/services'
import { ModelFamily } from '@/types'
import { isEmpty } from 'es-toolkit/compat'
import { useCallback, useEffect } from 'react'
import { useModelSelectorStore } from './useModelSelectorStores'

export const useModelSelectors = () => {
  const { selected_model_id, setLoadedModelFamily } = useModelSelectorStore()

  const onInitLoadModel = useCallback(async () => {
    if (isEmpty(selected_model_id)) {
      setLoadedModelFamily(ModelFamily.UNKNOWN)
      return
    }

    setLoadedModelFamily(ModelFamily.UNKNOWN)

    const result = await api.loadModel({ model_id: selected_model_id })
    setLoadedModelFamily(result.family)
  }, [selected_model_id, setLoadedModelFamily])

  useEffect(() => {
    onInitLoadModel()

    return () => {
      api.unloadModel()
    }
  }, [onInitLoadModel])
}
