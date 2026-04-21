import {
  ImageViewMode,
  useImageViewModeStore
} from '@/features/generator-previewers/states/useImageViewModeStore'
import { Select, SelectItem, Selection } from '@heroui/react'
import { GeneratorActionSubmitButton } from './GeneratorActionSubmitButton'

interface GeneratorActionProps {
  onGenerate: VoidFunction
  isGenerateDisabled?: boolean
}

export const GeneratorAction = ({
  onGenerate,
  isGenerateDisabled
}: GeneratorActionProps) => {
  const { viewMode, setViewMode } = useImageViewModeStore()

  const handleSelectionChange = (keys: Selection) => {
    const selectedKey = Array.from(keys)[0] as string
    setViewMode(selectedKey as ImageViewMode)
  }

  return (
    <div className="flex justify-between gap-4">
      <GeneratorActionSubmitButton
        onPress={onGenerate}
        isDisabled={isGenerateDisabled}
      />
      <Select
        className="max-w-32"
        selectedKeys={[viewMode]}
        onSelectionChange={handleSelectionChange}
        aria-label="View"
      >
        <SelectItem key="grid">Grid View</SelectItem>
        <SelectItem key="slider">Slider View</SelectItem>
      </Select>
    </div>
  )
}
