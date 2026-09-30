import { GeneratorConfigFormValues } from '@/features/generator-configs'
import { api } from '@/services'
import { ImageGenerationRequest } from '@/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SubmitHandler } from 'react-hook-form'
import { getGenerationHistoryConfig } from '@/features/generators/services/getGenerationHistoryConfig'
import { useGenerationStatusStore } from './useGenerationStatusStore'
import { useAddHistoryMutation } from './useAddHistoryMutation'
import {
  GENERATION_ERROR_ACTIONS,
  useGenerationErrorStore
} from './useGenerationErrorStore'
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
    onError: GENERATION_ERROR_ACTIONS.recordFailure,
    onSuccess: onCompleted
  })

  const onGenerate: SubmitHandler<GeneratorConfigFormValues> = async (
    config
  ) => {
    try {
      GENERATION_ERROR_ACTIONS.clear()
      onSetIsGenerating(true)
      const historyConfig = getGenerationHistoryConfig(
        config,
        isHiresFixEnabled
      )
      const history_id = await addHistory.mutateAsync(historyConfig)
      void refetchHistories()

      onInit(config.number_of_images)

      await generator.mutateAsync({ history_id, config: historyConfig })
    } catch (error) {
      // The generation mutation records its own failure in onError; a failed
      // addHistory only raised a toast, so the stage records it here.
      if (!useGenerationErrorStore.getState().failure) {
        GENERATION_ERROR_ACTIONS.recordFailure(error)
      }
    } finally {
      onSetIsGenerating(false)
      void refetchHistories()
    }
  }

  return { onGenerate }
}
