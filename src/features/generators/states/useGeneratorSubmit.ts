import {
  SocketConnectionStatus,
  useSocketConnectionStore
} from '@/cores/sockets'
import { GeneratorConfigFormValues } from '@/features/generator-configs'
import { generationRunService } from '@/features/generators/services/generation-run'
import { useModelLoadProgressStore } from '@/features/model-load-progress/states/useModelLoadProgressStore'
import { useModelSelectorStore } from '@/features/model-selectors/states'
import { GeneratorMode } from '@/types'
import { isEmpty } from 'es-toolkit/compat'
import { SubmitHandler, useFormContext } from 'react-hook-form'
import { useGenerationStatusStore } from './useGenerationStatusStore'
import { useGenerator } from './useGenerator'
import { useGeneratorModeStore } from './useGeneratorModeStore'
import { useImage2ImageConfigStore } from './useImage2ImageConfigStore'
import { useImage2ImageGenerator } from './useImage2ImageGenerator'
import { LAST_RUN_ACTIONS } from './useLastRunStore'

/**
 * The single place that starts a run: the dock button, Ctrl+Enter and the
 * failure panel's "Try again" all call onSubmit. It picks the generator for
 * the current mode and reports why a run cannot start.
 */
export const useGeneratorSubmit = () => {
  const { handleSubmit } = useFormContext<GeneratorConfigFormValues>()
  const mode = useGeneratorModeStore((state) => state.mode)
  const { onGenerate: onTextGenerate } = useGenerator()
  const { onGenerate: onImageGenerate } = useImage2ImageGenerator()
  const isGenerating = useGenerationStatusStore((state) => state.isGenerating)
  const connectionStatus = useSocketConnectionStore((state) => state.status)
  const loadingModelId = useModelLoadProgressStore((state) => state.model_id)
  const selectedModelId = useModelSelectorStore(
    (state) => state.selected_model_id
  )
  const initImageBase64 = useImage2ImageConfigStore(
    (state) => state.initImageBase64
  )

  const isImageMode = mode === GeneratorMode.IMAGE_2_IMAGE
  const disabledReason = generationRunService.getBlockReason({
    isBackendOffline: connectionStatus === SocketConnectionStatus.DISCONNECTED,
    isModelLoading: !isEmpty(loadingModelId),
    hasModel: !isEmpty(selectedModelId),
    needsInputImage: isImageMode && isEmpty(initImageBase64)
  })
  const isDisabled = isGenerating || Boolean(disabledReason)

  const onValid: SubmitHandler<GeneratorConfigFormValues> = (values) => {
    LAST_RUN_ACTIONS.setLastRun(values.prompt, values.seed, values.steps)

    if (isImageMode) return onImageGenerate(values)
    return onTextGenerate(values)
  }

  const submitValidForm = handleSubmit(onValid)

  const onSubmit = () => {
    if (isDisabled) return

    void submitValidForm()
  }

  return { onSubmit, isDisabled, isGenerating, disabledReason }
}
