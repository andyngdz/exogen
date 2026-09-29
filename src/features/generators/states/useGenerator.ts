import { GeneratorConfigFormValues } from '@/features/generator-configs'
import { api } from '@/services'
import { ImageGenerationRequest } from '@/types'
import { toast } from '@heroui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SubmitHandler } from 'react-hook-form'
import { getGenerationHistoryConfig } from '@/features/generators/services/getGenerationHistoryConfig'
import { useGenerationStatusStore } from './useGenerationStatusStore'
import { useAddHistoryMutation } from './useAddHistoryMutation'
import { useHiresFixEnabledStore } from './useHiresFixEnabledStore'
import { useUseImageGenerationStore } from './useImageGenerationResponseStores'

export const useGenerator = () => {
  const queryClient = useQueryClient()
  const refetchHistories = () =>
    queryClient.refetchQueries({ queryKey: ['getHistories'] })
  const onCompleted = useUseImageGenerationStore((state) => state.onCompleted)
  const onInit = useUseImageGenerationStore((state) => state.onInit)
  const onSetIsGenerating = useGenerationStatusStore(
    (state) => state.onSetIsGenerating
  )
  const isHiresFixEnabled = useHiresFixEnabledStore(
    (state) => state.isHiresFixEnabled
  )

  const addHistory = useAddHistoryMutation()

  const generator = useMutation({
    mutationKey: ['generator'],
    mutationFn: (request: ImageGenerationRequest) => {
      return api.generator(request)
    },
    onError: () => {
      toast.danger('Something went wrong', {
        description: 'There was an error generating your image.'
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
      void refetchHistories()

      onInit(config.number_of_images)

      await generator.mutateAsync({ history_id, config: historyConfig })
    } finally {
      onSetIsGenerating(false)
      void refetchHistories()
    }
  }

  return { onGenerate }
}
