'use client'

import { logViewService } from '@/features/backend-logs/services/log-view'
import { LogFilter } from '@/features/backend-logs/types'
import { ValueChanged } from '@/types'
import { toast } from '@heroui/react'
import { find, first, values } from 'es-toolkit/compat'
import { useLayoutEffect, useRef, useState } from 'react'
import type { Selection } from 'react-aria-components'
import { useBackendFolder } from './useBackendFolder'
import { useBackendLogStore } from './useBackendLogStore'

/** Backend logs as a full view: level filter, copy, folder, newest line in sight. */
export const useBackendLogView = () => {
  const logs = useBackendLogStore((state) => state.logs)
  const isStreaming = useBackendLogStore((state) => state.isStreaming)
  const { onOpenBackendFolder } = useBackendFolder()
  const [logFilter, setLogFilter] = useState(LogFilter.ALL)
  const scrollRef = useRef<HTMLDivElement>(null)

  const visibleLogs = logViewService.filterLogs(logs, logFilter)
  // Once the store is at its cap, a new line replaces the oldest and the
  // count stays put, so follow the last line itself.
  const lastLog = visibleLogs.at(-1)

  useLayoutEffect(() => {
    const list = scrollRef.current
    if (!list) return

    list.scrollTop = list.scrollHeight
  }, [lastLog, logFilter])

  const onFilterChange: ValueChanged<Selection> = (selection) => {
    if (selection === 'all') return

    const key = first(Array.from(selection))
    const nextFilter = find(values(LogFilter), (option) => option === key)
    if (nextFilter) setLogFilter(nextFilter)
  }

  const onCopyLogs = () => {
    navigator.clipboard
      .writeText(logViewService.toClipboardText(visibleLogs))
      .then(() => toast.success('Logs copied'))
      .catch(() =>
        toast.danger('Logs not copied', {
          description: 'The clipboard is not available. Try again.'
        })
      )
  }

  return {
    visibleLogs,
    isStreaming,
    logFilter,
    filters: logViewService.filters,
    scrollRef,
    onFilterChange,
    onCopyLogs,
    onOpenBackendFolder
  }
}
