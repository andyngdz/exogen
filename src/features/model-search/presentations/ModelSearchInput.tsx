import { useModelSearchQueryField } from '@/features/model-search/states/useModelSearchQueryField'
import { Input, TextField } from '@heroui/react'

export const ModelSearchInput = () => {
  const { query, onQueryChange } = useModelSearchQueryField()

  return (
    <TextField
      aria-label="Search models"
      value={query}
      onChange={onQueryChange}
    >
      <Input placeholder="Model name, author, ..." />
    </TextField>
  )
}
