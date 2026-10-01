import clsx from 'clsx'
import { Button } from '@heroui/react'
import { History, Sparkles } from 'lucide-react'
import { FC } from 'react'

interface HistoryEmptyViewProps {
  onGoToGenerate: VoidFunction
}

/** History with no runs yet, per frame 3j. */
export const HistoryEmptyView: FC<HistoryEmptyViewProps> = ({
  onGoToGenerate
}) => {
  return (
    <div
      className={clsx(
        'flex flex-1 flex-col items-center',
        'justify-center gap-4 pb-16 text-center'
      )}
    >
      <span
        className={clsx(
          'flex size-12 items-center justify-center',
          'rounded-2xl bg-surface text-muted'
        )}
      >
        <History size={22} />
      </span>
      <div className="flex max-w-sm flex-col gap-2">
        <h2 className="text-base font-semibold">No runs yet</h2>
        <p className="text-sm text-muted">
          Every run you generate lands here with its full config, so you can
          reuse or download it later.
        </p>
      </div>
      <Button variant="primary" onPress={onGoToGenerate}>
        <Sparkles size={16} />
        Go to Generate
      </Button>
    </div>
  )
}
