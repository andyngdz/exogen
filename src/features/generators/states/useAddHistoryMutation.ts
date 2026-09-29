import { GeneratorConfigFormValues } from '@/features/generator-configs'
import { api, standardizeErrorMessage } from '@/services'
import { toast } from '@heroui/react'
import { useMutation } from '@tanstack/react-query'

export const useAddHistoryMutation = () => {
  return useMutation({
    mutationKey: ['addHistory'],
    mutationFn: (config: GeneratorConfigFormValues) => {
      return api.addHistory(config)
    },
    onSuccess: () => {
      toast.success('Added history', {
        description: 'Your generation has been added to history.'
      })
    },
    onError: (error) => {
      toast.danger('Something went wrong', {
        description: standardizeErrorMessage(
          error,
          'There was an error adding your generation to history.'
        )
      })
    }
  })
}
