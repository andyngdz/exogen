import { useMaxMemoryMutation } from '@/cores/api-queries'
import { MAX_MEMORY_FORM_DEFAULTS } from '@/features/max-memory-scale-factor/constants'
import { MaxMemoryFormProps } from '@/features/max-memory-scale-factor/types'
import { useRouter } from 'next/navigation'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'

export const useMaxMemoryScaleFactorForm = () => {
  const router = useRouter()
  const { mutateAsync: setMaxMemory } = useMaxMemoryMutation()
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

  const onSubmit: SubmitHandler<MaxMemoryFormProps> = async (values) => {
    await setMaxMemory({
      gpuScaleFactor: values.gpuScaleFactor,
      ramScaleFactor: values.ramScaleFactor
    })

    router.push('/model-recommendations')
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
