import {
  useGenerationStatusStore,
  useUseImageGenerationStore
} from '@/features/generators'
import { SocketEvents, useSocketEvent } from '@/cores/sockets'
import { ImageGenerationStepEndResponse } from '@/types'
import { useCallback } from 'react'

export const useGeneratorPreviewer = () => {
  const imageStepEnds = useUseImageGenerationStore(
    (state) => state.imageStepEnds
  )
  const items = useUseImageGenerationStore((state) => state.items)
  const onUpdateImageStepEnd = useUseImageGenerationStore(
    (state) => state.onUpdateImageStepEnd
  )
  const isGenerating = useGenerationStatusStore((state) => state.isGenerating)

  const handleImageGenerationStepEnd = useCallback(
    (response: ImageGenerationStepEndResponse) => {
      // The backend broadcasts step events to every client without a generation id, and
      // isGenerating turns on before onInit creates the slots, so accept only initialized slots.
      if (!isGenerating || response.index >= items.length) return

      onUpdateImageStepEnd(response)
    },
    [isGenerating, items.length, onUpdateImageStepEnd]
  )

  useSocketEvent(
    SocketEvents.IMAGE_GENERATION_STEP_END,
    handleImageGenerationStepEnd,
    [handleImageGenerationStepEnd]
  )

  return { imageStepEnds, items }
}
