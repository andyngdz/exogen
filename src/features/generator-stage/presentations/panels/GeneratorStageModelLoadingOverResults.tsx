import { GeneratorStageResults } from '@/features/generator-stage/presentations/results/GeneratorStageResults'
import clsx from 'clsx'
import { GeneratorStageModelLoading } from './GeneratorStageModelLoading'

const stretchedColumn = clsx(
  'flex flex-col items-center gap-4',
  'min-h-0 w-full flex-1'
)

/** The last results stay visible but inert while the load progress sits over them. */
export const GeneratorStageModelLoadingOverResults = () => {
  return (
    <div className={clsx('relative', stretchedColumn)}>
      <div inert aria-hidden className={clsx(stretchedColumn, 'opacity-40')}>
        <GeneratorStageResults />
      </div>
      <div
        className={clsx(
          'absolute inset-x-0 top-1/3',
          'flex justify-center px-4'
        )}
      >
        <GeneratorStageModelLoading />
      </div>
    </div>
  )
}
