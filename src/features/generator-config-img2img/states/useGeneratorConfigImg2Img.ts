import {
  useGeneratorModeStore,
  useImage2ImageConfigStore
} from '@/features/generators'
import { sliderChangeService } from '@/services'
import {
  GeneratorMode,
  Image2ImageResizeMode,
  SliderChangeValue,
  ValueChanged
} from '@/types'
import { find, first, values } from 'es-toolkit/compat'
import type { Key, Selection } from 'react-aria-components'

export const useGeneratorConfigImg2Img = () => {
  const mode = useGeneratorModeStore((state) => state.mode)
  const strength = useImage2ImageConfigStore((state) => state.strength)
  const resizeMode = useImage2ImageConfigStore((state) => state.resizeMode)
  const setStrength = useImage2ImageConfigStore((state) => state.setStrength)
  const setResizeMode = useImage2ImageConfigStore(
    (state) => state.setResizeMode
  )

  const onStrengthChange: ValueChanged<SliderChangeValue> = (value) => {
    setStrength(sliderChangeService.toSingle(value))
  }

  const onResizeModeChange: ValueChanged<Key | null> = (key) => {
    const nextResizeMode = find(
      values(Image2ImageResizeMode),
      (resizeModeOption) => resizeModeOption === key
    )
    if (!nextResizeMode) return

    setResizeMode(nextResizeMode)
  }

  const onResizeModeSelectionChange: ValueChanged<Selection> = (keys) => {
    if (keys === 'all') return

    const key = first(Array.from(keys))
    if (!key) return

    onResizeModeChange(key)
  }

  return {
    isImage2Image: mode === GeneratorMode.IMAGE_2_IMAGE,
    strength,
    onStrengthChange,
    resizeMode,
    onResizeModeChange,
    onResizeModeSelectionChange
  }
}
