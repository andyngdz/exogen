import { api } from '@/services/api'
import { toast } from '@heroui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useDeleteHistory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['deleteHistory'],
    mutationFn: (history_id: number) => api.deleteHistory(history_id),
    onSuccess: async () => {
      toast.success('History deleted', {
        description: 'The history entry was removed successfully.'
      })
      await queryClient.refetchQueries({ queryKey: ['getHistories'] })
    },
    onError: (error) => {
      toast.danger('Delete failed', { description: error.message })
    }
  })
}
