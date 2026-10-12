import { useModelSelectorStore } from '@/features/model-selectors/states/useModelSelectorStores'
import { api } from '@/services/api'
import { toast } from '@heroui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useDeleteModel = () => {
  const queryClient = useQueryClient()
  const selected_model_id = useModelSelectorStore(
    (state) => state.selected_model_id
  )

  return useMutation({
    mutationKey: ['deleteModel'],
    mutationFn: (id: string) => {
      if (selected_model_id === id) {
        throw new Error(
          'The model is being used. Please unload before deleting'
        )
      }

      return api.deleteModel(id)
    },
    onSuccess: async () => {
      toast.success('Model deleted', {
        description: 'The model was removed successfully.'
      })
      await queryClient.refetchQueries({ queryKey: ['getDownloadedModels'] })
    },
    onError: (error) => {
      toast.danger('Delete failed', { description: error.message })
    }
  })
}
