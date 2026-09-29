import { ModelSearchFormValues } from '@/features/model-search/types'
import { useController, useFormContext } from 'react-hook-form'

export const useModelSearchQueryField = () => {
  const { control } = useFormContext<ModelSearchFormValues>()
  const { field } = useController({ control, name: 'query' })

  return { query: field.value, onQueryChange: field.onChange }
}
