'use client'

import { useMaxMemoryMutation } from '@/cores/api-queries'
import { GpuDetectionFormProps } from '@/features/gpu-detection/types/gpu-detection'
import { api } from '@/services'
import { apiErrorService } from '@/services/errors'
import { toast } from '@heroui/react'
import { useRouter } from 'next/navigation'
import { SubmitHandler, useFormContext } from 'react-hook-form'
import { useSelectedGpu } from './useSelectedGpu'

/** The Continue button: saves the GPU, then the memory limits, then moves on. */
export const useGpuDetectionContinue = () => {
  const router = useRouter()
  const { handleSubmit } = useFormContext<GpuDetectionFormProps>()
  const { gpu } = useSelectedGpu()
  const { mutate: setMaxMemory } = useMaxMemoryMutation()

  // Step 1: save the GPU, then Step 2: the memory limits, which move on when saved.
  const onSubmit: SubmitHandler<GpuDetectionFormProps> = async (values) => {
    try {
      await api.selectDevice({ device_index: values.gpu })
    } catch (error) {
      toast.danger('GPU not selected', {
        description: apiErrorService.toMessage(
          error,
          'The backend did not save the GPU. Try again.'
        )
      })
      return
    }

    // Stay on this step when saving fails; the mutation shows why.
    setMaxMemory(
      {
        gpuScaleFactor: values.gpuScaleFactor,
        ramScaleFactor: values.ramScaleFactor
      },
      { onSuccess: () => router.push('/model-recommendations') }
    )
  }

  const submit = handleSubmit(onSubmit)

  return {
    isContinueDisabled: !gpu,
    onContinue: () => void submit()
  }
}
