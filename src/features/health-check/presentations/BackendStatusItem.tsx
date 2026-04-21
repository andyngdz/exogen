'use client'

import { dateFormatter } from '@/services/date-formatter'
import { Badge } from '@heroui/react'
import { BackendStatusLevel } from '@types'
import { CircleCheck, CircleDashed } from 'lucide-react'
import { FC } from 'react'
import { BackendSetupStatusEntry } from '../states'
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
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
          <Badge color={isError ? 'danger' : 'secondary'} variant="flat">
            {status.message}
          </Badge>
        </div>
        <span className="text-tiny text-default-500">
          {dateFormatter.timeFromTimestamp(status.timestamp)}
        </span>
      </div>
      {status.commands && <SuggestedCommands commands={status.commands} />}
    </div>
  )
}
