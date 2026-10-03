import {
  LAST_RUN_ACTIONS,
  useFormValuesStore,
  useHiresFixEnabledStore,
  useUseImageGenerationStore
} from '@/features/generators'
import { HistoryItem } from '@/types'

export const useUseConfig = (history: HistoryItem) => {
  const onSetValues = useFormValuesStore((state) => state.onSetValues)
  const onRestore = useUseImageGenerationStore((state) => state.onRestore)
  const setIsHiresFixEnabled = useHiresFixEnabledStore(
    (state) => state.setIsHiresFixEnabled
  )

  const onUseConfig = () => {
    const { config } = history
    onSetValues(config)
    // The switch lives outside the form; a run made without hires fix has
    // hires_fix: null, which would leave the switch on over an empty upscaler.
    setIsHiresFixEnabled(Boolean(config.hires_fix))
    onRestore(history.generated_images)
    // The viewer reads prompt and seed from the last run, so the restored
    // images must bring their own run with them.
    LAST_RUN_ACTIONS.setLastRun(config.prompt, config.seed, config.steps)
  }

  return { onUseConfig }
}
