import { GeneratorConfigFormValues } from '@/features/generator-configs'

export const getGenerationHistoryConfig = (
  config: GeneratorConfigFormValues,
  isHiresFixEnabled: boolean
): GeneratorConfigFormValues => {
  if (isHiresFixEnabled) return config

  const { hires_fix: _hiresFix, ...configWithoutHiresFix } = config
  return configWithoutHiresFix as GeneratorConfigFormValues
}
