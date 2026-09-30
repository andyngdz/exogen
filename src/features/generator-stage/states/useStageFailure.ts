import {
  useGenerationErrorStore,
  useGeneratorSubmit
} from '@/features/generators/states'

export const useStageFailure = () => {
  const failure = useGenerationErrorStore((state) => state.failure)
  const { onSubmit, isDisabled } = useGeneratorSubmit()

  return {
    title: failure?.step
      ? `Generation failed at step ${failure.step}`
      : 'Generation failed',
    message: failure?.message,
    onTryAgain: onSubmit,
    isTryAgainDisabled: isDisabled
  }
}
