import { GeneratorConfigFormValues } from '@/features/generator-configs'
import { api, standardizeErrorMessage } from '@/services'
import { addToast } from '@heroui/react'
import { useMutation } from '@tanstack/react-query'

export const useAddHistoryMutation = () => {
  return useMutation({
    mutationKey: ['addHistory'],
    mutationFn: (config: GeneratorConfigFormValues) => {
      return api.addHistory(config)
    },
    onSuccess: () => {
      addToast({
        title: 'Added history',
        description: 'Your generation has been added to history.',
        color: 'success'
      })
    },
    onError: (error) => {
      addToast({
        title: 'Something went wrong',
        description: standardizeErrorMessage(
          error,
          'There was an error adding your generation to history.'
        ),
        color: 'danger'
      })
    }
  })
}
