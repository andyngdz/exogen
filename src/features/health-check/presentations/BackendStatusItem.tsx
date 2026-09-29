'use client'

import { BackendSetupStatusEntry } from '@/features/health-check/states'
import { dateFormatter } from '@/services/date-formatter'
import { Chip } from '@heroui/react'
import { BackendStatusLevel } from '@types'
import { isEmpty } from 'es-toolkit/compat'
import { CircleCheck, CircleDashed } from 'lucide-react'
import { FC } from 'react'
import { SuggestedCommands } from './SuggestedCommands'

export interface BackendStatusItemProps {
  status: BackendSetupStatusEntry
  isLast: boolean
}

export const BackendStatusItem: FC<BackendStatusItemProps> = ({
  status,
  isLast
}) => {
  const isError = status.level === BackendStatusLevel.Error
  const isRunning = isLast && !isError
  const isCompleted = !isLast && !isError
  const commands = status.commands ?? []
  const hasCommands = !isEmpty(commands)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {isRunning && (
            <CircleDashed
              className="text-warning shrink-0"
              aria-label="Running"
              size={16}
            />
          )}
          {isCompleted && (
            <CircleCheck
              className="text-success shrink-0"
              aria-label="Completed"
              size={16}
            />
          )}
          <Chip color={isError ? 'danger' : 'accent'} variant="soft">
            {status.message}
          </Chip>
        </div>
        <span className="text-xs text-muted">
          {dateFormatter.timeFromTimestamp(status.timestamp)}
        </span>
      </div>
      {hasCommands && <SuggestedCommands commands={commands} />}
    </div>
  )
}
