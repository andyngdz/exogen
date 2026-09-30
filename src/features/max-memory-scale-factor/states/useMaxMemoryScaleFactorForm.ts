import { useMaxMemoryMutation } from '@/cores/api-queries'
import { MAX_MEMORY_FORM_DEFAULTS } from '@/features/max-memory-scale-factor/constants'
import { MaxMemoryFormProps } from '@/features/max-memory-scale-factor/types'
import { useRouter } from 'next/navigation'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'

export const useMaxMemoryScaleFactorForm = () => {
  const router = useRouter()
  const { mutate: setMaxMemory } = useMaxMemoryMutation()
  const { handleSubmit, setValue, control } = useForm<MaxMemoryFormProps>({
    defaultValues: MAX_MEMORY_FORM_DEFAULTS
  })

  const gpuScaleFactor = useWatch({
    name: 'gpuScaleFactor',
    control,
    defaultValue: MAX_MEMORY_FORM_DEFAULTS.gpuScaleFactor
  })
  const ramScaleFactor = useWatch({
    name: 'ramScaleFactor',
    control,
    defaultValue: MAX_MEMORY_FORM_DEFAULTS.ramScaleFactor
  })

  // Stay on this step when saving fails; the mutation shows why.
  const onSubmit: SubmitHandler<MaxMemoryFormProps> = (values) => {
    setMaxMemory(
      {
        gpuScaleFactor: values.gpuScaleFactor,
        ramScaleFactor: values.ramScaleFactor
      },
      { onSuccess: () => router.push('/model-recommendations') }
    )
  }

  const onGpuChange = (scaleFactor: number) => {
    setValue('gpuScaleFactor', scaleFactor)
  }

  const onRamChange = (scaleFactor: number) => {
    setValue('ramScaleFactor', scaleFactor)
  }

  return {
    gpuScaleFactor,
    ramScaleFactor,
    onGpuChange,
    onRamChange,
    onNext: handleSubmit(onSubmit),
    onBack: router.back
  }
}
