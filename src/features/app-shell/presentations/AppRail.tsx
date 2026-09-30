import ExoGenLogo from '@/assets/logo.png'
import { useAppRail } from '@/features/app-shell/states/useAppRail'
import { AppView } from '@/features/app-shell/types'
import { Box, History, Settings, Sparkles, SquareTerminal } from 'lucide-react'
import clsx from 'clsx'
import NextImage from 'next/image'
import { AppRailItem } from './AppRailItem'

export const AppRail = () => {
  const { activeView, onOpenView, onOpenModels, onOpenSettings } = useAppRail()

  return (
    <nav
      aria-label="Main"
      className={clsx(
        'flex flex-col justify-between gap-4',
        'w-15 shrink-0 py-4',
        'border-r border-separator'
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <NextImage src={ExoGenLogo} alt="ExoGen" width={28} height={28} />
        <AppRailItem
          label="Generate"
          icon={<Sparkles size={18} />}
          isActive={activeView === AppView.GENERATE}
          onPress={() => onOpenView(AppView.GENERATE)}
        />
        <AppRailItem
          label="Models"
          icon={<Box size={18} />}
          onPress={onOpenModels}
        />
        <AppRailItem
          label="History"
          icon={<History size={18} />}
          isActive={activeView === AppView.HISTORY}
          onPress={() => onOpenView(AppView.HISTORY)}
        />
      </div>
      <div className="flex flex-col items-center gap-2">
        <AppRailItem
          label="Backend logs"
          icon={<SquareTerminal size={18} />}
          isActive={activeView === AppView.LOGS}
          onPress={() => onOpenView(AppView.LOGS)}
        />
        <AppRailItem
          label="Settings"
          icon={<Settings size={18} />}
          isActive={activeView === AppView.SETTINGS}
          onPress={onOpenSettings}
        />
      </div>
    </nav>
  )
}
