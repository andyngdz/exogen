import { useGeneratorConfigStyleSearch } from '@/features/generator-config-styles/states'
import { StyleSection } from '@/types'
import { Chip, Modal, ModalBackdropProps } from '@heroui/react'
import { FC, useMemo } from 'react'
import { GeneratorConfigStyleEmptyState } from './GeneratorConfigStyleEmptyState'
import { GeneratorConfigStyleSearchInput } from './GeneratorConfigStyleSearchInput'
import { GeneratorConfigStyleSection } from './GeneratorConfigStyleSection'

export interface GeneratorConfigStyleModalProps extends Pick<
  ModalBackdropProps,
  'isOpen' | 'onOpenChange'
> {
  styleSections: StyleSection[]
}

export const GeneratorConfigStyleModal: FC<GeneratorConfigStyleModalProps> = ({
  styleSections,
  isOpen,
  onOpenChange
}) => {
  const { query, setQuery, onClear, filteredSections, isEmptyState } =
    useGeneratorConfigStyleSearch(styleSections)

  const content = useMemo(() => {
    if (isEmptyState) {
      return <GeneratorConfigStyleEmptyState query={query} />
    }

    return <GeneratorConfigStyleSection styleSections={filteredSections} />
  }, [isEmptyState, query, filteredSections])

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container placement="bottom" size="lg" scroll="inside">
          <Modal.Dialog className="max-w-2xl">
            <Modal.CloseTrigger />
            <Modal.Header className="flex flex-row justify-between items-center gap-2 pe-8">
              <Modal.Heading>Styles</Modal.Heading>
              <Chip color="warning" variant="soft" size="sm">
                Some styles may contain NSFW content. Please preview before
                applying
              </Chip>
            </Modal.Header>
            <div className="pb-4">
              <GeneratorConfigStyleSearchInput
                value={query}
                onChange={setQuery}
                onClear={onClear}
              />
            </div>
            <Modal.Body>{content}</Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
