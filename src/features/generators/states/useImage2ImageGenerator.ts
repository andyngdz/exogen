import {
  GeneratorConfigFormValues,
  GeneratorImage2ImageConfigFormValues
} from '@/features/generator-configs'
import { useImage2ImageConfigStore } from '@/features/generators/states/useImage2ImageConfigStore'
import { api } from '@/services'
import { toast } from '@heroui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SubmitHandler } from 'react-hook-form'
import { getGenerationHistoryConfig } from '@/features/generators/services/getGenerationHistoryConfig'
import { useAddHistoryMutation } from './useAddHistoryMutation'
import { useGenerationStatusStore } from './useGenerationStatusStore'
import { useHiresFixEnabledStore } from './useHiresFixEnabledStore'
import { useUseImageGenerationStore } from './useImageGenerationResponseStores'

export const useImage2ImageGenerator = () => {
  const queryClient = useQueryClient()
  const onCompleted = useUseImageGenerationStore((state) => state.onCompleted)
  const onInit = useUseImageGenerationStore((state) => state.onInit)
  const onSetIsGenerating = useGenerationStatusStore(
    (state) => state.onSetIsGenerating
  )
  const isHiresFixEnabled = useHiresFixEnabledStore(
    (state) => state.isHiresFixEnabled
  )

  const initImageBase64 = useImage2ImageConfigStore(
    (state) => state.initImageBase64
  )
  const strength = useImage2ImageConfigStore((state) => state.strength)
  const resizeMode = useImage2ImageConfigStore((state) => state.resizeMode)

  const addHistory = useAddHistoryMutation()

  const img2img = useMutation({
    mutationKey: ['img2img'],
    mutationFn: (request: {
      history_id: number
      config: GeneratorImage2ImageConfigFormValues
    }) => {
      return api.img2img(request)
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
    if (!initImageBase64) {
      toast.warning('Missing input image', {
        description: 'Please select an image to use for Image-to-Image.'
      })
      return
    }

    try {
      onSetIsGenerating(true)

      const historyConfig = getGenerationHistoryConfig(
        config,
        isHiresFixEnabled
      )
      const history_id = await addHistory.mutateAsync(historyConfig)
      queryClient.refetchQueries({ queryKey: ['getHistories'] })

      onInit(config.number_of_images)

      const img2imgConfig: GeneratorImage2ImageConfigFormValues = {
        ...historyConfig,
        init_image: initImageBase64,
        strength,
        resize_mode: resizeMode
      }

      await img2img.mutateAsync({ history_id, config: img2imgConfig })
    } finally {
      onSetIsGenerating(false)
      queryClient.refetchQueries({ queryKey: ['getHistories'] })
    }
  }

  return { onGenerate }
}
