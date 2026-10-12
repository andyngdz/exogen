import { stageFailureService } from '@/features/generator-stage/services/stage-failure'
import {
  useGenerationErrorStore,
  useGeneratorSubmit,
  useLastRunStore
} from '@/features/generators/states'

export const useStageFailure = () => {
  const failure = useGenerationErrorStore((state) => state.failure)
  const totalSteps = useLastRunStore((state) => state.steps)
  const { onSubmit, isDisabled } = useGeneratorSubmit()

  return {
    title: stageFailureService.toTitle(failure?.step, totalSteps),
    message: failure?.message,
    onTryAgain: onSubmit,
    isTryAgainDisabled: isDisabled
  }
}
