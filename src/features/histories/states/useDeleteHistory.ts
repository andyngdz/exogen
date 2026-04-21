import { api } from '@/services/api'
import { addToast } from '@heroui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useDeleteHistory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['deleteHistory'],
    mutationFn: (history_id: number) => api.deleteHistory(history_id),
    onSuccess: async () => {
      addToast({
        title: 'History deleted',
        description: 'The history entry was removed successfully.',
        color: 'success'
      })
      await queryClient.refetchQueries({ queryKey: ['getHistories'] })
    },
    onError: (error) => {
      addToast({
        title: 'Delete failed',
        description: error.message,
        color: 'danger'
      })
    }
  })
}
