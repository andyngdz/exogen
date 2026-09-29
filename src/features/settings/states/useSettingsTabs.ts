import { find, values } from 'es-toolkit/compat'
import type { Key } from 'react-aria-components'
import { SettingsTab, useSettingsStore } from './useSettingsStore'

export const useSettingsTabs = () => {
  const selectedTab = useSettingsStore((state) => state.selectedTab)
  const setSelectedTab = useSettingsStore((state) => state.setSelectedTab)

  const onSelectionChange = (key: Key) => {
    const tab = find(values(SettingsTab), (settingsTab) => settingsTab === key)
    if (!tab) return

    setSelectedTab(tab)
  }

  return { selectedTab, onSelectionChange }
}
