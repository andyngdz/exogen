import { seedService } from '@/features/generator-config-seed/services/seed'
import { useGeneratorConfigForm } from '@/features/generator-configs/states/useGeneratorConfigForm'
import { useWatch } from 'react-hook-form'

const RANDOM_SEED = -1

export const useGeneratorConfigSeed = () => {
  const { control, getValues, setValue } = useGeneratorConfigForm()
  const seed = useWatch({
    control,
    name: 'seed',
    defaultValue: getValues('seed')
  })

  const setSeed = (value: number) => {
    setValue('seed', value, { shouldValidate: true, shouldTouch: true })
  }

  const onRandomizeSeed = () => setSeed(seedService.generate())

  // Turning Random off starts from a fresh fixed seed, not the -1 sentinel.
  const onRandomSeedChange = (isRandom: boolean) => {
    setSeed(isRandom ? RANDOM_SEED : seedService.generate())
  }

  return {
    isRandomSeed: seed === RANDOM_SEED,
    onRandomizeSeed,
    onRandomSeedChange
  }
}
