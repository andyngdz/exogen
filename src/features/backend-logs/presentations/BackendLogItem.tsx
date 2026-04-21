import { dateFormatter } from '@/services'
import { LogEntry } from '@types'
import clsx from 'clsx'
import { FC } from 'react'
import stripAnsi from 'strip-ansi'
import { backendLogsService } from '../services'

export interface BackendLogItemProps {
  log: LogEntry
}

export const BackendLogItem: FC<BackendLogItemProps> = ({ log }) => {
  const { timestamp, level, message } = log

  return (
    <div className="flex gap-1 text-sm font-medium py-1">
      <span
        className={clsx(
          backendLogsService.onGetBackgroundColor(level),
          'w-1 shrink-0 rounded-sm'
        )}
      />
      <span className="shrink-0 min-w-10 text-default">
        {dateFormatter.timeFromTimestamp(timestamp)}
      </span>
      <span
        className={clsx(
          'wrap-break-word',
          backendLogsService.onGetLogColor(level)
        )}
      >
        {stripAnsi(message)}
      </span>
    </div>
  )
}
