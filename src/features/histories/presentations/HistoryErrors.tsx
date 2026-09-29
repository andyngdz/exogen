import clsx from 'clsx'
import { ApiError } from '@/types'
import { FC } from 'react'

export interface HistoryErrorsProps {
  error: ApiError
}

export const HistoryErrors: FC<HistoryErrorsProps> = ({ error }) => {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center gap-2',
        'h-96 p-4'
      )}
    >
      <div className="font-semibold text-danger">Error loading history</div>
      <div className="text-foreground text-sm text-center">{error.message}</div>
    </div>
  )
}
