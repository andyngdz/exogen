'use client'

import { useHardwareQuery } from '@/cores/api-queries'
import { useMaxMemoryScaleFactorForm } from '@/features/max-memory-scale-factor/states/useMaxMemoryScaleFactorForm'
import { GpuDetectionFormProps } from '@/features/gpu-detection/types/gpu-detection'
import { api } from '@/services'
import { apiErrorService } from '@/services/errors'
import { toast } from '@heroui/react'
import { findIndex } from 'es-toolkit/compat'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'

/** The Hardware step: the detected GPU, which one to use, and the memory limits. */
export const useHardwareStep = () => {
  const { data: hardware, refetch } = useHardwareQuery()
  const gpus = hardware?.gpus ?? []
  // The array position is the backend device_index.
  const primaryIndex = findIndex(gpus, { is_primary: true })
  const gpuValues = { gpu: Math.max(primaryIndex, 0) }
  const gpuForm = useForm<GpuDetectionFormProps>({ values: gpuValues })
  const memory = useMaxMemoryScaleFactorForm()
  const gpuIndex = useWatch({
    control: gpuForm.control,
    name: 'gpu',
    defaultValue: gpuValues.gpu
  })
  const selectedGpu = gpus.at(gpuIndex)

  // Step 1: save the GPU, then Step 2: the memory limits, which move on when saved.
  const onSubmit: SubmitHandler<GpuDetectionFormProps> = async ({ gpu }) => {
    try {
      await api.selectDevice({ device_index: gpu })
    } catch (error) {
      toast.danger('GPU not selected', {
        description: apiErrorService.toMessage(
          error,
          'The backend did not save the GPU. Try again.'
        )
      })
      return
    }

    await memory.onNext()
  }

  const submitGpu = gpuForm.handleSubmit(onSubmit)

  return {
    hardware,
    gpuForm,
    selectedGpu,
    hasManyGpus: gpus.length > 1,
    memory,
    isContinueDisabled: !selectedGpu,
    onCheckAgain: () => void refetch(),
    onContinue: () => void submitGpu(),
    onBack: memory.onBack
  }
}
