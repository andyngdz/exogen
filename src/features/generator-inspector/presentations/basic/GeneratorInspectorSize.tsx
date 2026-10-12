import { NumberInputController } from '@/cores/presentations/NumberInputController'
import { GeneratorConfigFormValues } from '@/features/generator-configs'
import { imageSizeService } from '@/features/generator-inspector/services/image-size-service'
import { useImageSizePreset } from '@/features/generator-inspector/states/useImageSizePreset'
import { Button, ToggleButton, ToggleButtonGroup } from '@heroui/react'
import { map } from 'es-toolkit/compat'
import { ArrowLeftRight } from 'lucide-react'

export const GeneratorInspectorSize = () => {
  const {
    presets,
    selectedPreset,
    isCustom,
    width,
    height,
    onPresetChange,
    onSwap
  } = useImageSizePreset()

  return (
    <div className="flex flex-col gap-2">
      <ToggleButtonGroup
        aria-label="Size preset"
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={[selectedPreset]}
        onSelectionChange={onPresetChange}
        size="sm"
        fullWidth
      >
        {map(presets, (preset) => (
          <ToggleButton key={preset} id={preset}>
            {imageSizeService.getPresetLabel(preset)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {isCustom && (
        <div className="flex items-center gap-2">
          <NumberInputController<GeneratorConfigFormValues>
            aria-label="Width"
            controlName="width"
            minValue={64}
            step={8}
            startContent={<span className="text-sm text-muted">W</span>}
          />
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label="Swap width and height"
            onPress={onSwap}
          >
            <ArrowLeftRight size={16} />
          </Button>
          <NumberInputController<GeneratorConfigFormValues>
            aria-label="Height"
            controlName="height"
            minValue={64}
            step={8}
            startContent={<span className="text-sm text-muted">H</span>}
          />
        </div>
      )}
      {!isCustom && (
        <span className="text-xs text-muted tabular-nums">
          {width} × {height}
        </span>
      )}
    </div>
  )
}
