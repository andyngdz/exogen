import {
  LAST_RUN_ACTIONS,
  useFormValuesStore,
  useUseImageGenerationStore
} from '@/features/generators'
import { HistoryItem } from '@/types'

export const useUseConfig = (history: HistoryItem) => {
  const onSetValues = useFormValuesStore((state) => state.onSetValues)
  const onRestore = useUseImageGenerationStore((state) => state.onRestore)

  const onUseConfig = () => {
    const { config } = history
    onSetValues(config)
    onRestore(history.generated_images)
    // The viewer reads prompt and seed from the last run, so the restored
    // images must bring their own run with them.
    LAST_RUN_ACTIONS.setLastRun(config.prompt, config.seed, config.steps)
  }

  return { onUseConfig }
}
