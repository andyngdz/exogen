'use client'

import { useModelSelectorMenu } from '@/features/model-selectors/states/useModelSelectorMenu'
import { Button, Dropdown, Spinner } from '@heroui/react'
import { map } from 'es-toolkit/compat'
import { ChevronDown } from 'lucide-react'
import { useMemo } from 'react'

export const ModelSelector = () => {
  const {
    downloadedModels,
    selectedModelId,
    familyLabel,
    isLoading,
    loadPercentLabel,
    onSelectionChange
  } = useModelSelectorMenu()

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

  const StatusIcon = useMemo(() => {
    if (isLoading) return <Spinner size="sm" color="current" />
    return <span className="size-2 rounded-full bg-success" />
  }, [isLoading])

  const trailingLabel = isLoading ? loadPercentLabel : familyLabel

  return (
    <Dropdown>
      <Button variant="outline">
        {StatusIcon}
        <span className="max-w-60 min-w-0 truncate">
          {selectedModelId || 'Select a model'}
        </span>
        {trailingLabel && (
          <span className="font-mono text-xs text-muted">{trailingLabel}</span>
        )}
        <ChevronDown size={16} className="text-muted" />
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
