import { Button } from '@heroui/react'
import clsx from 'clsx'
import { RotateCcw, TriangleAlert } from 'lucide-react'
import { FC } from 'react'

interface HistoryErrorViewProps {
  message: string
  onRetry: VoidFunction
}

/** History could not be loaded: the reason and a way to try again. */
export const HistoryErrorView: FC<HistoryErrorViewProps> = ({
  message,
  onRetry
}) => {
  return (
    <div
      className={clsx(
        'flex flex-1 flex-col items-center justify-center gap-4',
        'pb-16 text-center'
      )}
    >
      <span
        className={clsx(
          'flex size-12 items-center justify-center',
          'rounded-2xl bg-danger-soft text-danger-soft-foreground'
        )}
      >
        <TriangleAlert size={22} />
      </span>
      <div className="flex max-w-sm flex-col gap-2">
        <h2 className="text-base font-semibold">History did not load</h2>
        <p className="text-sm text-muted">{message}</p>
      </div>
      <Button variant="secondary" onPress={onRetry}>
        <RotateCcw size={16} />
        Try again
      </Button>
    </div>
  )
}
