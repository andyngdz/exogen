import { useSafetyCheckMutation } from '@/cores/api-queries'
import { ValueChanged } from '@/types'
import { SETTINGS_ACTIONS, useSettingsStore } from './useSettingsStore'

export const useGeneralSettings = () => {
  const values = useSettingsStore((state) => state.values)
  const { mutate: setSafetyCheck } = useSafetyCheckMutation()

  const onSafetyCheckChange: ValueChanged<boolean> = (isEnabled) => {
    SETTINGS_ACTIONS.setValues({ ...values, safety_check_enabled: isEnabled })
    // Put the switch back if the backend did not take the change.
    setSafetyCheck(isEnabled, {
      onError: () => SETTINGS_ACTIONS.setValues(values)
    })
  }

  return {
    isSafetyCheckEnabled: values.safety_check_enabled,
    onSafetyCheckChange
  }
}
