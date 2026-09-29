import { ImageViewMode } from '@/features/generator-previewers/states/useImageViewModeStore'
import { useImageViewMode } from '@/features/generator-previewers/states/useImageViewMode'
import { ListBox, Select } from '@heroui/react'
import { GeneratorActionSubmitButton } from './GeneratorActionSubmitButton'

interface GeneratorActionProps {
  onGenerate: VoidFunction
  isGenerateDisabled?: boolean
}

export const GeneratorAction = ({
  onGenerate,
  isGenerateDisabled
}: GeneratorActionProps) => {
  const { viewMode, onViewModeChange } = useImageViewMode()

  return (
    <div className="flex justify-between gap-4">
      <GeneratorActionSubmitButton
        onPress={onGenerate}
        isDisabled={isGenerateDisabled}
      />
      <Select
        className="max-w-32"
        value={viewMode}
        onChange={onViewModeChange}
        aria-label="View"
      >
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item id={ImageViewMode.GRID} textValue="Grid View">
              Grid View
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id={ImageViewMode.SLIDER} textValue="Slider View">
              Slider View
              <ListBox.ItemIndicator />
            </ListBox.Item>
          </ListBox>
        </Select.Popover>
      </Select>
    </div>
  )
}
