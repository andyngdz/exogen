import { LoraCard } from '@/features/extra-loras/presentations'
import { useLoraSelection } from '@/features/extra-loras/states'
import { Button, useDisclosure } from '@heroui/react'
import { Plus } from 'lucide-react'
import { ExtraModal } from './ExtraModal'

export const ExtraSelector = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const { selectedLoras, removeLora } = useLoraSelection()

  return (
    <section className="flex flex-col gap-4 p-4">
      <div className="flex gap-4 items-center justify-between">
        <span className="font-semibold text-sm">Extra</span>
        <Button variant="light" onPress={onOpen} isIconOnly>
          <Plus />
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {selectedLoras.map((lora) => (
          <LoraCard
            key={lora.id}
            lora={lora}
            onRemove={() => removeLora(lora.id)}
          />
        ))}
      </div>

      <ExtraModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </section>
  )
}
