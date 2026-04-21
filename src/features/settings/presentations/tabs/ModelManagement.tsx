import { useDownloadedModels } from '@/features/settings/states/useDownloadedModels'
import { Listbox, ListboxItem, Spinner } from '@heroui/react'
import { SettingsBase } from '../SettingsBase'
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
      <Listbox aria-label="Models list">
        {data.map((model) => (
          <ListboxItem
            key={model.model_id}
            endContent={<DeleteModelButton model_id={model.model_id} />}
          >
            {model.model_id}
          </ListboxItem>
        ))}
      </Listbox>
    </SettingsBase>
  )
}
