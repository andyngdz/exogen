'use client'

import { useDownloadedModels } from '@/cores/hooks'
import { ModelFamily } from '@/types'
import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger
} from '@heroui/react'
import { map } from 'es-toolkit/compat'
import { ChevronDown } from 'lucide-react'
import { useMemo } from 'react'
import { useModelSelectors, useModelSelectorStore } from '../states'

export const ModelSelector = () => {
  useModelSelectors()
  const { downloadedModels } = useDownloadedModels()
  const { selected_model_id, loaded_model_family, setSelectedModelId } =
    useModelSelectorStore()

  const familyLabel = useMemo(() => {
    if (loaded_model_family === ModelFamily.UNKNOWN) return

    switch (loaded_model_family) {
      case ModelFamily.SD15:
        return 'SD 1.5'
      case ModelFamily.SDXL:
        return 'SDXL'
      case ModelFamily.SD2:
        return 'SD 2.x'
      case ModelFamily.SD3:
        return 'SD3'
      case ModelFamily.FLUX:
        return 'FLUX'
      default:
        return
    }
  }, [loaded_model_family])

  const items = useMemo(() => {
    return map(downloadedModels, (d) => {
      return <DropdownItem key={d.model_id}>{d.model_id}</DropdownItem>
    })
  }, [downloadedModels])

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          variant="light"
          color="primary"
          endContent={<ChevronDown size={16} />}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="min-w-0 truncate">{selected_model_id}</span>
            {familyLabel && (
              <Chip size="sm" variant="flat">
                <span>{familyLabel}</span>
              </Chip>
            )}
          </span>
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Model selector"
        selectedKeys={[selected_model_id]}
        selectionMode="single"
        onSelectionChange={(id) => {
          if (id.currentKey) {
            setSelectedModelId(id.currentKey)
          }
        }}
      >
        {items}
      </DropdownMenu>
    </Dropdown>
  )
}
