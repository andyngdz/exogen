import { useGeneratorConfigForm } from '@/features/generator-configs/states/useGeneratorConfigForm'

export const useGeneratorConfigCommonSteps = () => {
  const { setValue } = useGeneratorConfigForm()

  const onStepSelect = (step: number) => {
    setValue('steps', step)
  }

  return { onStepSelect }
}
