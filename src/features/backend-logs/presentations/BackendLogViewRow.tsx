import { logViewService } from '@/features/backend-logs/services/log-view'
import { LogEntry } from '@types'
import clsx from 'clsx'
import { FC } from 'react'

interface BackendLogViewRowProps {
  log: LogEntry
}

/** One log line: time, level and message, tinted when it is a warning or an error. */
export const BackendLogViewRow: FC<BackendLogViewRowProps> = ({ log }) => {
  const isWarning = log.level === 'warn'
  const isError = log.level === 'error'

  return (
    <div
      className={clsx('flex items-start gap-4', 'px-4 py-1 font-mono text-xs', {
        'bg-warning-soft': isWarning,
        'bg-danger-soft': isError
      })}
    >
      <span className="w-24 shrink-0 text-muted tabular-nums">
        {logViewService.toTime(log.timestamp)}
      </span>
      <span
        className={clsx('w-16 shrink-0 font-medium', {
          'text-accent-soft-foreground': !isWarning && !isError,
          'text-warning-soft-foreground': isWarning,
          'text-danger': isError
        })}
      >
        {logViewService.toLevelLabel(log.level)}
      </span>
      <span className="min-w-0 flex-1 wrap-break-word">
        {logViewService.toMessage(log.message)}
      </span>
    </div>
  )
}
