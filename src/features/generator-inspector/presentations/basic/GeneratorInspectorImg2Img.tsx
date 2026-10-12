import { useGeneratorConfigImg2Img } from '@/features/generator-config-img2img/states/useGeneratorConfigImg2Img'
import { Image2ImageResizeMode } from '@/types'
import { Label, Slider, ToggleButton, ToggleButtonGroup } from '@heroui/react'

export const GeneratorInspectorImg2Img = () => {
  const {
    strength,
    onStrengthChange,
    resizeMode,
    onResizeModeSelectionChange
  } = useGeneratorConfigImg2Img()

  return (
    <div className="flex flex-col gap-4">
      <Slider
        step={0.05}
        minValue={0}
        maxValue={1}
        value={strength}
        onChange={onStrengthChange}
      >
        <Label>Denoising strength</Label>
        <Slider.Output />
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb />
        </Slider.Track>
      </Slider>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm">Resize mode</span>
        <ToggleButtonGroup
          aria-label="Resize mode"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[resizeMode]}
          onSelectionChange={onResizeModeSelectionChange}
          size="sm"
        >
          <ToggleButton id={Image2ImageResizeMode.RESIZE}>Resize</ToggleButton>
          <ToggleButton id={Image2ImageResizeMode.CROP}>Crop</ToggleButton>
        </ToggleButtonGroup>
      </div>
    </div>
  )
}
