import { useGeneratorPreviewer } from '@/features/generator-previewers/states'
import { useGeneratorModeStore } from '@/features/generators/states'
import { GeneratorMode } from '@/types'
import { isEmpty } from 'es-toolkit/compat'
import { useState } from 'react'

/**
 * Current run for the single view. It owns the step-end listener through
 * useGeneratorPreviewer, so mount it once, in place of the grid.
 */
export const useStageSingle = () => {
  const { imageStepEnds, items } = useGeneratorPreviewer()
  const mode = useGeneratorModeStore((state) => state.mode)
  const [pickedIndex, setPickedIndex] = useState(0)

  // A new run can have fewer images than the index picked in the last one.
  const selectedIndex = Math.min(pickedIndex, Math.max(0, items.length - 1))

  return {
    imageStepEnds,
    hasRun: !isEmpty(imageStepEnds),
    isImageMode: mode === GeneratorMode.IMAGE_2_IMAGE,
    selectedStepEnd: imageStepEnds.at(selectedIndex),
    selectedIndex,
    onSelect: setPickedIndex
  }
}
