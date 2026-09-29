import { useStyleSections } from '@/cores/hooks/useStyleSections'
import { useDefaultStyles } from '@/features/generator-config-styles/states'
import { Button, useOverlayState } from '@heroui/react'
import { Plus } from 'lucide-react'
import { useMemo } from 'react'
import { GeneratorConfigStyleAddButtonLoader } from './GeneratorConfigStyleAddButtonLoader'
import { GeneratorConfigStyleModal } from './GeneratorConfigStyleModal'
import { GeneratorConfigStyleSelectedPreviewer } from './GeneratorConfigStyleSelectedPreviewer'

export const GeneratorConfigStyle = () => {
  useDefaultStyles()
  const modalState = useOverlayState()
  const { styleSections, isLoading } = useStyleSections()

  const addButton = useMemo(() => {
    if (isLoading) return <GeneratorConfigStyleAddButtonLoader />

    return (
      <Button variant="ghost" onPress={modalState.open} isIconOnly>
        <Plus />
      </Button>
    )
  }, [isLoading, modalState.open])

  return (
    <section className="flex flex-col gap-4 p-4">
      <div>
        <div className="flex gap-4 items-center justify-between">
          <span className="font-semibold text-sm">Styles</span>
          {addButton}
        </div>
        <GeneratorConfigStyleModal
          styleSections={styleSections}
          isOpen={modalState.isOpen}
          onOpenChange={modalState.setOpen}
        />
      </div>
      <GeneratorConfigStyleSelectedPreviewer />
    </section>
  )
}
