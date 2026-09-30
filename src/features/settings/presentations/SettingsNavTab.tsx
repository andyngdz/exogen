import { SettingsTab } from '@/features/settings/states/useSettingsStore'
import { Tabs } from '@heroui/react'
import { LucideIcon } from 'lucide-react'
import { FC } from 'react'

interface SettingsNavTabProps {
  id: SettingsTab
  label: string
  icon: LucideIcon
}

/** One section in the settings nav, with its icon. */
export const SettingsNavTab: FC<SettingsNavTabProps> = ({
  id,
  label,
  icon: Icon
}) => {
  return (
    <Tabs.Tab id={id} className="justify-start">
      <span className="flex w-full items-center gap-2 whitespace-nowrap">
        <Icon size={16} />
        {label}
      </span>
      <Tabs.Indicator />
    </Tabs.Tab>
  )
}
