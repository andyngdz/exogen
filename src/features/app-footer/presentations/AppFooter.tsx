import { BackendLog } from '@/features/backend-logs'
import { SettingsButton } from '@/features/settings'

export const AppFooter = () => {
  return (
    <footer className="sticky bottom-0 z-10 border-t border-default">
      <div className="px-4 flex justify-between items-center">
        <div className="text-sm text-default-700">
          © {new Date().getFullYear()} ExoGen
        </div>
        <div className="flex gap-2">
          <BackendLog />
          <SettingsButton />
        </div>
      </div>
    </footer>
  )
}
