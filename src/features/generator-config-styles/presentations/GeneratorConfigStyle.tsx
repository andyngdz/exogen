import { useStyleSections } from '@/cores/hooks/useStyleSections'
import { Button, Skeleton, useDisclosure } from '@heroui/react'
import { Plus } from 'lucide-react'
import { useDefaultStyles } from '../states'
import { GeneratorConfigStyleModal } from './GeneratorConfigStyleModal'
import { GeneratorConfigStyleSelectedPreviewer } from './GeneratorConfigStyleSelectedPreviewer'

export const GeneratorConfigStyle = () => {
  useDefaultStyles()
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const { styleSections, isLoading } = useStyleSections()

  return (
    <section className="flex flex-col gap-4 p-4">
      <div>
        <div className="flex gap-4 items-center justify-between">
          <span className="font-semibold text-sm">Styles</span>
          {isLoading ? (
            <Skeleton className="rounded-xl w-10 h-10" />
          ) : (
            <Button variant="light" onPress={onOpen} isIconOnly>
              <Plus />
            </Button>
          )}
        </div>
        <GeneratorConfigStyleModal
          styleSections={styleSections}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        />
      </div>
      <GeneratorConfigStyleSelectedPreviewer />
    </section>
  )
}
