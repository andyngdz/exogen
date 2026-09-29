'use client'

import { useModelSelectorMenu } from '@/features/model-selectors/states/useModelSelectorMenu'
import { Button, Chip, Dropdown } from '@heroui/react'
import { map } from 'es-toolkit/compat'
import { ChevronDown } from 'lucide-react'
import { useMemo } from 'react'

export const ModelSelector = () => {
  const { downloadedModels, selectedModelId, familyLabel, onSelectionChange } =
    useModelSelectorMenu()

  const items = useMemo(() => {
    return map(downloadedModels, (downloadedModel) => {
      return (
        <Dropdown.Item
          key={downloadedModel.model_id}
          id={downloadedModel.model_id}
          textValue={downloadedModel.model_id}
        >
          {downloadedModel.model_id}
        </Dropdown.Item>
      )
    })
  }, [downloadedModels])

  return (
    <Dropdown>
      <Button variant="ghost" className="text-accent">
        <span className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 truncate">{selectedModelId}</span>
          {familyLabel && (
            <Chip size="sm" variant="soft">
              {familyLabel}
            </Chip>
          )}
        </span>
        <ChevronDown size={16} />
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu
          aria-label="Model selector"
          selectedKeys={[selectedModelId]}
          selectionMode="single"
          onSelectionChange={onSelectionChange}
        >
          {items}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  )
}
