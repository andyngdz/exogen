import { LogFilter } from '@/features/backend-logs/types'
import { LogEntry } from '@types'
import { map } from 'es-toolkit/compat'
import { describe, expect, it } from 'vitest'
import { logViewService } from '../log-view'

const logs: LogEntry[] = [
  { level: 'log', message: 'Uvicorn running', timestamp: 1 },
  { level: 'info', message: 'Model ready', timestamp: 2 },
  { level: 'warn', message: 'xformers not installed', timestamp: 3 },
  {
    level: 'error',
    message: '\u001b[31mCUDA out of memory\u001b[0m',
    timestamp: 4
  }
]

describe('logViewService', () => {
  it.each([
    [LogFilter.ALL, [1, 2, 3, 4]],
    [LogFilter.INFO, [1, 2]],
    [LogFilter.WARNINGS, [3]],
    [LogFilter.ERRORS, [4]]
  ])('keeps the lines for %s', (logFilter, timestamps) => {
    expect(
      map(logViewService.filterLogs(logs, logFilter), 'timestamp')
    ).toEqual(timestamps)
  })

  it('copies lines as plain text without colour codes', () => {
    const text = logViewService.toClipboardText([logs[3]])

    expect(text).toMatch(/ ERROR CUDA out of memory$/)
    expect(text).not.toContain('\u001b')
  })
})
