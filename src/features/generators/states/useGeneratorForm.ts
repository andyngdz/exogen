'use client'

import { GeneratorConfigFormValues } from '@/features/generator-configs'
import { FORM_DEFAULT_VALUES } from '@/features/generators/constants'
import { generatorConfigService } from '@/features/generators/services/generator-config'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useDeepCompareEffect, useLocalStorage } from 'react-use'
import { useFormValuesStore } from './useFormValuesStore'

export const useGeneratorForm = () => {
  const storeValues = useFormValuesStore((state) => state.values)

  // Get values from localStorage (returns stored value + setter)
  const [localStorageValues, setLocalStorage] = useLocalStorage(
    'generator-form-values',
    FORM_DEFAULT_VALUES
  )

  const methods = useForm<GeneratorConfigFormValues>({
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: generatorConfigService.clampFormValues(
      localStorageValues ?? FORM_DEFAULT_VALUES
    )
  })

  const formValues = useWatch({ control: methods.control })

  useDeepCompareEffect(() => {
    setLocalStorage(formValues as GeneratorConfigFormValues)
  }, [formValues, setLocalStorage])

  // Reset form when Zustand updates externally (e.g., history restore)
  useEffect(() => {
    if (!storeValues) return

    methods.reset(generatorConfigService.clampFormValues(storeValues))
  }, [methods, storeValues])

  return { methods }
}
