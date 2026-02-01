import type { ReactNode } from 'react'
import {
  FormProvider,
  type FieldValues,
  useForm,
  type UseFormProps,
  type UseFormReturn
} from 'react-hook-form'

import type { GeneratorConfigFormValues } from '@/features/generator-configs'
import { generatorConfigFormDefaults } from './generator-config-defaults'

export type FormProviderWrapperOptions<TFieldValues extends FieldValues> = {
  formOptions?: UseFormProps<TFieldValues>
  onMethods?: (methods: UseFormReturn<TFieldValues>) => void
}

export const createFormProviderWrapper = <TFieldValues extends FieldValues>(
  options: FormProviderWrapperOptions<TFieldValues> = {}
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => {
    const methods = useForm<TFieldValues>(options.formOptions)
    options.onMethods?.(methods)
    return <FormProvider {...methods}>{children}</FormProvider>
  }

  Wrapper.displayName = 'FormProviderWrapper'
  return Wrapper
}

export type GeneratorConfigFormWrapperOptions = {
  overrides?: Partial<GeneratorConfigFormValues>
  onMethods?: (methods: UseFormReturn<GeneratorConfigFormValues>) => void
}

export const createGeneratorConfigFormWrapper = (
  options: GeneratorConfigFormWrapperOptions = {}
) => {
  return createFormProviderWrapper<GeneratorConfigFormValues>({
    formOptions: {
      defaultValues: generatorConfigFormDefaults(options.overrides)
    },
    onMethods: options.onMethods
  })
}
