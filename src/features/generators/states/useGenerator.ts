import { GeneratorConfigFormValues } from '@/features/generator-configs'
import { api } from '@/services'
import { ImageGenerationRequest } from '@/types'
import { addToast } from '@heroui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SubmitHandler } from 'react-hook-form'
import { getGenerationHistoryConfig } from '../services/getGenerationHistoryConfig'
import { useGenerationStatusStore } from './useGenerationStatusStore'
import { useAddHistoryMutation } from './useAddHistoryMutation'
import { useHiresFixEnabledStore } from './useHiresFixEnabledStore'
import { useUseImageGenerationStore } from './useImageGenerationResponseStores'

export const useGenerator = () => {
  const queryClient = useQueryClient()
  const { onCompleted, onInit } = useUseImageGenerationStore()
  const { onSetIsGenerating } = useGenerationStatusStore()
  const { isHiresFixEnabled } = useHiresFixEnabledStore()

  const addHistory = useAddHistoryMutation()

  const generator = useMutation({
    mutationKey: ['generator'],
    mutationFn: (request: ImageGenerationRequest) => {
      return api.generator(request)
    },
    onError: () => {
      addToast({
        title: 'Something went wrong',
        description: 'There was an error generating your image.',
        color: 'danger'
      })
    },
    onSuccess: onCompleted
  })

  const onGenerate: SubmitHandler<GeneratorConfigFormValues> = async (
    config
  ) => {
    try {
      onSetIsGenerating(true)
      const historyConfig = getGenerationHistoryConfig(
        config,
        isHiresFixEnabled
      )
      const history_id = await addHistory.mutateAsync(historyConfig)
      queryClient.refetchQueries({ queryKey: ['getHistories'] })

      onInit(config.number_of_images)

      await generator.mutateAsync({ history_id, config: historyConfig })
    } finally {
      onSetIsGenerating(false)
      queryClient.refetchQueries({ queryKey: ['getHistories'] })
    }
  }

  return { onGenerate }
}
