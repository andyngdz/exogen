import { useSettingsModal } from '@/features/settings/states/useSettingsModal'
import { Button } from '@heroui/react'
import { Settings } from 'lucide-react'
import { SettingsModal } from './SettingsModal'

export const SettingsButton = () => {
  const { isModalOpen, onOpen, onOpenChange } = useSettingsModal()

  return (
    <div>
      <Button
        isIconOnly
        variant="ghost"
        aria-label="Settings"
        onPress={onOpen}
        className="text-foreground"
      >
        <Settings size={16} />
      </Button>
      <SettingsModal isOpen={isModalOpen} onOpenChange={onOpenChange} />
    </div>
  )
}
