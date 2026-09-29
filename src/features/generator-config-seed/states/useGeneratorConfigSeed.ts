import { seedService } from '@/features/generator-config-seed/services/seed'
import { useGeneratorConfigForm } from '@/features/generator-configs/states/useGeneratorConfigForm'

export const useGeneratorConfigSeed = () => {
  const { setValue } = useGeneratorConfigForm()

  const onRandomizeSeed = () => {
    setValue('seed', seedService.generate(), {
      shouldValidate: true,
      shouldTouch: true
    })
  }

  return { onRandomizeSeed }
}
