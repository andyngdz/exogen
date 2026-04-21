import { StyleSection } from '@/types'
import {
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalProps
} from '@heroui/react'
import { FC, useMemo } from 'react'
import { useGeneratorConfigStyleSearch } from '../states'
import { GeneratorConfigStyleEmptyState } from './GeneratorConfigStyleEmptyState'
import { GeneratorConfigStyleSearchInput } from './GeneratorConfigStyleSearchInput'
import { GeneratorConfigStyleSection } from './GeneratorConfigStyleSection'

export interface GeneratorConfigStyleModalProps extends Omit<
  ModalProps,
  'children'
> {
  styleSections: StyleSection[]
}

export const GeneratorConfigStyleModal: FC<GeneratorConfigStyleModalProps> = ({
  styleSections,
  ...restProps
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
    <Modal placement="bottom" size="2xl" scrollBehavior="inside" {...restProps}>
      <ModalContent>
        <ModalHeader className="flex justify-between items-center gap-2">
          <span>Styles</span>
          <Chip
            color="warning"
            variant="flat"
            size="sm"
            className="mr-4"
            role="alert"
          >
            Some styles may contain NSFW content. Please preview before applying
          </Chip>
        </ModalHeader>
        <div className="px-6 pb-4">
          <GeneratorConfigStyleSearchInput
            value={query}
            onChange={setQuery}
            onClear={onClear}
          />
        </div>
        <ModalBody>{content}</ModalBody>
      </ModalContent>
    </Modal>
  )
}
