import {
  GeneratorConfigFormValues,
  GeneratorImage2ImageConfigFormValues
} from '@/features/generator-configs'
import { useImage2ImageConfigStore } from '@/features/generators/states/useImage2ImageConfigStore'
import { api } from '@/services'
import { addToast } from '@heroui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SubmitHandler } from 'react-hook-form'
import { getGenerationHistoryConfig } from '../services/getGenerationHistoryConfig'
import { useAddHistoryMutation } from './useAddHistoryMutation'
import { useGenerationStatusStore } from './useGenerationStatusStore'
import { useHiresFixEnabledStore } from './useHiresFixEnabledStore'
import { useUseImageGenerationStore } from './useImageGenerationResponseStores'

export const useImage2ImageGenerator = () => {
  const queryClient = useQueryClient()
  const { onCompleted, onInit } = useUseImageGenerationStore()
  const { onSetIsGenerating } = useGenerationStatusStore()
  const { isHiresFixEnabled } = useHiresFixEnabledStore()

  const { initImageBase64, strength, resizeMode } = useImage2ImageConfigStore()

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
    if (!initImageBase64) {
      addToast({
        title: 'Missing input image',
        description: 'Please select an image to use for Image-to-Image.',
        color: 'warning'
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
