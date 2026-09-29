'use client'

import { useGeneratorConfigImg2Img } from '@/features/generator-config-img2img/states/useGeneratorConfigImg2Img'
import { Image2ImageResizeMode } from '@/types'
import { Label, ListBox, Select, Slider } from '@heroui/react'

export const GeneratorConfigImg2Img = () => {
  const {
    isImage2Image,
    strength,
    onStrengthChange,
    resizeMode,
    onResizeModeChange
  } = useGeneratorConfigImg2Img()

  if (!isImage2Image) return

  return (
    <div className="flex flex-col gap-4 p-4">
      <span className="font-semibold text-sm">Image to Image</span>
      <Slider
        step={0.05}
        minValue={0}
        maxValue={1}
        value={strength}
        onChange={onStrengthChange}
        className="max-w-full"
      >
        <Label className="text-muted">Denoising Strength</Label>
        <Slider.Output className="text-muted" />
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb />
        </Slider.Track>
      </Slider>
      <Select value={resizeMode} onChange={onResizeModeChange}>
        <Label>Resize Mode</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item id={Image2ImageResizeMode.RESIZE} textValue="Resize">
              Resize
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id={Image2ImageResizeMode.CROP} textValue="Crop">
              Crop
              <ListBox.ItemIndicator />
            </ListBox.Item>
          </ListBox>
        </Select.Popover>
      </Select>
    </div>
  )
}
