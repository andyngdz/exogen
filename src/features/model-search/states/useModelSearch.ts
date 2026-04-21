import { api } from '@/services'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@uidotdev/usehooks'
import { first, isEmpty, isString } from 'es-toolkit/compat'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { ModelSearchFormValues } from '../types'
import { onResetModelId, onUpdateModelId } from './useModelSearchSelectorStores'

export const useModelSearch = () => {
  const { watch } = useFormContext<ModelSearchFormValues>()
  const query = watch('query')
  const queryDebounced = useDebounce(query, 500)

  const { data = [], isLoading } = useQuery({
    queryKey: ['modelSearch', queryDebounced],
    enabled: isString(queryDebounced),
    queryFn: async () => {
      const response = await api.searchModel(queryDebounced)
      return response.models_search_info
    }
  })

  useEffect(() => {
    onResetModelId()
  }, [queryDebounced])

  useEffect(() => {
    if (isEmpty(data)) return

    const firstModelSearchInfo = first(data)

    if (firstModelSearchInfo) {
      onUpdateModelId(firstModelSearchInfo.id)
    }
  }, [data])

  return { data, isLoading }
}
