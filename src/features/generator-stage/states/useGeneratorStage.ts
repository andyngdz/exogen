import { useHistoriesQuery } from '@/cores/api-queries'
import {
  SocketConnectionStatus,
  useSocketConnectionStore
} from '@/cores/sockets'
import { stageViewService } from '@/features/generator-stage/services/stage-view'
import {
  useGenerationErrorStore,
  useGeneratorModeStore,
  useUseImageGenerationStore
} from '@/features/generators/states'
import { useModelLoadStatus } from '@/features/model-load-progress/states'
import { useModelSelectorStore } from '@/features/model-selectors/states'
import { GeneratorMode } from '@/types'
import { isEmpty } from 'es-toolkit/compat'

export const useGeneratorStage = () => {
  const connectionStatus = useSocketConnectionStore((state) => state.status)
  const { isLoading: isModelLoading } = useModelLoadStatus()
  const failure = useGenerationErrorStore((state) => state.failure)
  const selectedModelId = useModelSelectorStore(
    (state) => state.selected_model_id
  )
  const items = useUseImageGenerationStore((state) => state.items)
  const { data: histories } = useHistoriesQuery()
  const mode = useGeneratorModeStore((state) => state.mode)

  const view = stageViewService.toView({
    isBackendOffline: connectionStatus === SocketConnectionStatus.DISCONNECTED,
    isModelLoading,
    hasFailure: Boolean(failure),
    hasModel: !isEmpty(selectedModelId),
    hasOutput: !isEmpty(items) || !isEmpty(histories),
    isImageMode: mode === GeneratorMode.IMAGE_2_IMAGE
  })

  return { view }
}
