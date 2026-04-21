import { useSafetyCheckMutation } from '@/cores/api-queries'
import { isBoolean } from 'es-toolkit/compat'
import { useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useShallowCompareEffect } from 'react-use'
import { SettingFormValues } from '../types/settings'
import { useSettingsStore } from './useSettingsStore'

export const useGeneralSettings = () => {
  const { values, setValues } = useSettingsStore()
  const { register, control } = useForm<SettingFormValues>({
    defaultValues: values,
    values
  })
  const formValues = useWatch({ control })
  const { mutate: setSafetyCheck } = useSafetyCheckMutation()
  const isInitialMount = useRef(true)

  useShallowCompareEffect(() => {
    setValues(formValues as SettingFormValues)

    // Skip mutation on initial mount to avoid syncing persisted values
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    // Sync safety check with backend when changed by user
    if (isBoolean(formValues.safety_check_enabled)) {
      setSafetyCheck(formValues.safety_check_enabled)
    }
  }, [formValues, setValues, setSafetyCheck])

  return { register }
}
