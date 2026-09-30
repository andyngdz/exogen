import { Button, useOverlayState } from '@heroui/react'
import { Plus } from 'lucide-react'
import { ModelSearchModal } from './ModelSearchModal'

export const ModelSearchOpenIconButton = () => {
  const modalState = useOverlayState()

  return (
    <section>
      <Button
        variant="ghost"
        className="text-accent"
        isIconOnly
        aria-label="Open model search"
        onPress={modalState.open}
      >
        <Plus />
      </Button>
      <ModelSearchModal
        isOpen={modalState.isOpen}
        onOpenChange={modalState.setOpen}
      />
    </section>
  )
}
