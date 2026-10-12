import { find, values } from 'es-toolkit/compat'
import type { Key } from 'react-aria-components'
import {
  SETTINGS_ACTIONS,
  SettingsTab,
  useSettingsStore
} from './useSettingsStore'

export const useSettingsTabs = () => {
  const selectedTab = useSettingsStore((state) => state.selectedTab)

  const onSelectionChange = (key: Key) => {
    const tab = find(values(SettingsTab), (settingsTab) => settingsTab === key)
    if (!tab) return

    SETTINGS_ACTIONS.setSelectedTab(tab)
  }

  return { selectedTab, onSelectionChange }
}
