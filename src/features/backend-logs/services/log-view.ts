import { LogFilter } from '@/features/backend-logs/types'
import { LogEntry, LogLevel } from '@types'
import dayjs from 'dayjs'
import { filter, includes, map } from 'es-toolkit/compat'
import stripAnsi from 'strip-ansi'

const FILTER_LEVELS: Record<LogFilter, LogLevel[]> = {
  [LogFilter.ALL]: ['log', 'info', 'warn', 'error'],
  [LogFilter.INFO]: ['log', 'info'],
  [LogFilter.WARNINGS]: ['warn'],
  [LogFilter.ERRORS]: ['error']
}

export class LogViewService {
  readonly filters = [
    { id: LogFilter.ALL, label: 'All' },
    { id: LogFilter.INFO, label: 'Info' },
    { id: LogFilter.WARNINGS, label: 'Warnings' },
    { id: LogFilter.ERRORS, label: 'Errors' }
  ]

  /** The log lines a level filter keeps. */
  filterLogs(logs: LogEntry[], logFilter: LogFilter) {
    return filter(logs, (log) => includes(FILTER_LEVELS[logFilter], log.level))
  }

  /** Time with milliseconds, as the backend stamps its lines. */
  toTime(timestamp: number) {
    return dayjs(timestamp).format('HH:mm:ss.SSS')
  }

  toLevelLabel(level: LogLevel) {
    return level.toUpperCase()
  }

  toMessage(message: string) {
    return stripAnsi(message)
  }

  /** Plain text for the clipboard, one line per entry. */
  toClipboardText(logs: LogEntry[]) {
    return map(
      logs,
      (log) =>
        `${this.toTime(log.timestamp)} ${this.toLevelLabel(log.level)} ${this.toMessage(log.message)}`
    ).join('\n')
  }
}

export const logViewService = new LogViewService()
