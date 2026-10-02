import { SettingsTab } from '@/features/settings/states/useSettingsStore'
import { Tabs } from '@heroui/react'
import { LucideIcon } from 'lucide-react'
import { FC, ReactNode } from 'react'

interface SettingsNavTabProps {
  id: SettingsTab
  label: string
  icon: LucideIcon
  indicator?: ReactNode
}

/** One section in the settings nav, with its icon. */
export const SettingsNavTab: FC<SettingsNavTabProps> = ({
  id,
  label,
  icon: Icon,
  indicator
}) => {
  return (
    <Tabs.Tab id={id} className="justify-start text-start">
      <span className="flex w-full items-center gap-2 whitespace-nowrap">
        <Icon size={16} />
        <span className="flex-1">{label}</span>
        {indicator}
      </span>
      <Tabs.Indicator />
    </Tabs.Tab>
  )
}
