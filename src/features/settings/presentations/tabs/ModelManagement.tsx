import { useDownloadedModels } from '@/features/settings/states/useDownloadedModels'
import { ListBox, Spinner } from '@heroui/react'
import { map } from 'es-toolkit/compat'
import { SettingsBase } from '@/features/settings/presentations/SettingsBase'
import { DeleteModelButton } from './DeleteModelButton'

export const ModelManagement = () => {
  const { data = [], isLoading } = useDownloadedModels()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <SettingsBase
      title="Model Management"
      description="Manage your installed AI models"
    >
      <ListBox aria-label="Models list" renderEmptyState={() => 'No items.'}>
        {map(data, (model) => (
          <ListBox.Item
            key={model.model_id}
            id={model.model_id}
            textValue={model.model_id}
          >
            {model.model_id}
            <DeleteModelButton model_id={model.model_id} />
          </ListBox.Item>
        ))}
      </ListBox>
    </SettingsBase>
  )
}
