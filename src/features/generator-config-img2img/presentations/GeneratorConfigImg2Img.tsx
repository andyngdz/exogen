'use client'

import {
  useImage2ImageConfigStore,
  useGeneratorModeStore
} from '@/features/generators'
import { GeneratorMode, Image2ImageResizeMode } from '@/types'
import { Select, SelectItem, Slider } from '@heroui/react'

export const GeneratorConfigImg2Img = () => {
  const { mode } = useGeneratorModeStore()
  const { strength, resizeMode, setStrength, setResizeMode } =
    useImage2ImageConfigStore()

  if (mode !== GeneratorMode.IMAGE_2_IMAGE) return null

  return (
    <div className="flex flex-col gap-4 p-4">
      <span className="font-semibold text-sm">Image to Image</span>
      <Slider
        label="Denoising Strength"
        size="sm"
        step={0.05}
        minValue={0}
        maxValue={1}
        value={strength}
        onChange={(value) => setStrength(value as number)}
        className="max-w-full"
        classNames={{
          label: 'text-default-500',
          value: 'text-default-500'
        }}
      />
      <Select
        label="Resize Mode"
        selectedKeys={[resizeMode]}
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0] as Image2ImageResizeMode
          setResizeMode(selectedKey)
        }}
        size="sm"
        aria-label="Resize mode"
      >
        <SelectItem key={Image2ImageResizeMode.RESIZE}>Resize</SelectItem>
        <SelectItem key={Image2ImageResizeMode.CROP}>Crop</SelectItem>
      </Select>
    </div>
  )
}
