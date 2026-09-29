import { LoraCard } from '@/features/extra-loras/presentations'
import { useLoraSelection } from '@/features/extra-loras/states'
import { Button, useOverlayState } from '@heroui/react'
import { map } from 'es-toolkit/compat'
import { Plus } from 'lucide-react'
import { ExtraModal } from './ExtraModal'

export const ExtraSelector = () => {
  const modalState = useOverlayState()
  const { selectedLoras, removeLora } = useLoraSelection()

  return (
    <section className="flex flex-col gap-4 p-4">
      <div className="flex gap-4 items-center justify-between">
        <span className="font-semibold text-sm">Extra</span>
        <Button variant="ghost" onPress={modalState.open} isIconOnly>
          <Plus />
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {map(selectedLoras, (lora) => (
          <LoraCard
            key={lora.id}
            lora={lora}
            onRemove={() => removeLora(lora.id)}
          />
        ))}
      </div>

      <ExtraModal
        isOpen={modalState.isOpen}
        onOpenChange={modalState.setOpen}
      />
    </section>
  )
}
