import { GeneratorConfigFormValues } from '@/features/generator-configs/types/generator-config'
import { useFormContext } from 'react-hook-form'

export const useGeneratorConfigForm = () =>
  useFormContext<GeneratorConfigFormValues>()
