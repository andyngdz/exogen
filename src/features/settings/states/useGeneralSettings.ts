import { useSafetyCheckMutation } from '@/cores/api-queries'
import { ValueChanged } from '@/types'
import { useSettingsStore } from './useSettingsStore'

export const useGeneralSettings = () => {
  const values = useSettingsStore((state) => state.values)
  const setValues = useSettingsStore((state) => state.setValues)
  const { mutate: setSafetyCheck } = useSafetyCheckMutation()

  const onSafetyCheckChange: ValueChanged<boolean> = (isEnabled) => {
    setValues({ ...values, safety_check_enabled: isEnabled })
    setSafetyCheck(isEnabled)
  }

  return {
    isSafetyCheckEnabled: values.safety_check_enabled,
    onSafetyCheckChange
  }
}
