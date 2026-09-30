import {
  GENERATION_ERROR_ACTIONS,
  useGeneratorModeStore,
  useImage2ImageConfigStore
} from '@/features/generators'
import { GeneratorMode, ValueChanged } from '@/types'
import { find, values } from 'es-toolkit/compat'
import type { Key } from 'react-aria-components'

export const useGeneratorModeTabs = () => {
  const mode = useGeneratorModeStore((state) => state.mode)
  const setMode = useGeneratorModeStore((state) => state.setMode)
  const clearInitImageBase64 = useImage2ImageConfigStore(
    (state) => state.clearInitImageBase64
  )

  const onModeChange: ValueChanged<Key> = (key) => {
    const nextMode = find(
      values(GeneratorMode),
      (modeOption) => modeOption === key
    )
    if (!nextMode) return

    setMode(nextMode)
    GENERATION_ERROR_ACTIONS.clear()

    if (nextMode === GeneratorMode.TEXT_2_IMAGE) {
      clearInitImageBase64()
    }
  }

  return { mode, onModeChange }
}
