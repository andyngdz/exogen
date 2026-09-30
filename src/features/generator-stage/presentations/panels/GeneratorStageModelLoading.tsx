import { useModelLoadStatus } from '@/features/model-load-progress/states'
import { ProgressBar } from '@heroui/react'
import clsx from 'clsx'

export const GeneratorStageModelLoading = () => {
  const { modelId, message, percentage } = useModelLoadStatus()

  return (
    <section
      aria-label="Model loading"
      className={clsx(
        'flex w-110 max-w-full flex-col gap-2 p-4',
        'rounded-3xl bg-overlay shadow-overlay'
      )}
    >
      <ProgressBar value={percentage} aria-label={`Loading ${modelId}`}>
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="truncate font-medium">Loading {modelId}</span>
          <ProgressBar.Output className="font-mono" />
        </div>
        <ProgressBar.Track>
          <ProgressBar.Fill />
        </ProgressBar.Track>
      </ProgressBar>
      <span className="text-xs text-muted">{message}</span>
    </section>
  )
}
