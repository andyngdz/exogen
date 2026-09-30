import { useRecentRuns } from '@/features/generator-stage/states/useRecentRuns'
import { isEmpty, map } from 'es-toolkit/compat'
import { GeneratorStageRecentRun } from './GeneratorStageRecentRun'

export const GeneratorStageRecentRuns = () => {
  const { recentRuns } = useRecentRuns()

  if (isEmpty(recentRuns)) return

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-muted">Recent</span>
      <div className="flex gap-2">
        {map(recentRuns, (recentRun) => (
          <GeneratorStageRecentRun
            key={recentRun.history.id}
            recentRun={recentRun}
          />
        ))}
      </div>
    </div>
  )
}
