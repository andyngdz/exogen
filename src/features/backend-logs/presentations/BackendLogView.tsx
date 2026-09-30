'use client'

import { useBackendLogView } from '@/features/backend-logs/states/useBackendLogView'
import { Button, Chip, ToggleButton, ToggleButtonGroup } from '@heroui/react'
import clsx from 'clsx'
import { isEmpty, map } from 'es-toolkit/compat'
import { Copy, FolderOpen } from 'lucide-react'
import { BackendLogViewRow } from './BackendLogViewRow'

/** Backend logs as a rail view, per frame 2e. */
export const BackendLogView = () => {
  const {
    visibleLogs,
    isStreaming,
    logFilter,
    filters,
    scrollRef,
    onFilterChange,
    onCopyLogs,
    onOpenBackendFolder
  } = useBackendLogView()

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0">
      <header
        className={clsx(
          'flex items-center justify-between gap-4',
          'h-14 shrink-0 px-6'
        )}
      >
        <div className="flex items-center gap-4">
          <h1 className="text-base font-semibold">Backend logs</h1>
          {isStreaming && (
            <Chip size="sm" color="success" variant="soft">
              Streaming
            </Chip>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ToggleButtonGroup
            aria-label="Log level"
            size="sm"
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[logFilter]}
            onSelectionChange={onFilterChange}
          >
            {map(filters, (option) => (
              <ToggleButton key={option.id} id={option.id}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Button
            isIconOnly
            variant="ghost"
            aria-label="Copy logs"
            onPress={onCopyLogs}
          >
            <Copy size={16} />
          </Button>
          <Button variant="outline" onPress={onOpenBackendFolder}>
            <FolderOpen size={16} />
            Open backend folder
          </Button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 px-6 pb-6">
        <div
          ref={scrollRef}
          role="log"
          aria-label="Backend log lines"
          className={clsx(
            'flex flex-col gap-0',
            'min-h-0 flex-1 overflow-y-auto py-2',
            'rounded-2xl bg-surface'
          )}
        >
          {isEmpty(visibleLogs) && (
            <p className="px-4 py-2 text-sm text-muted">
              No log lines for this filter yet.
            </p>
          )}
          {map(visibleLogs, (log, index) => (
            <BackendLogViewRow key={`${log.timestamp}-${index}`} log={log} />
          ))}
        </div>
      </div>
    </div>
  )
}
