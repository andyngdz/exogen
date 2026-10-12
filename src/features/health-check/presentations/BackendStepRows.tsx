import {
  BackendStepRow,
  BackendStepRowState
} from '@/features/health-check/types'
import { Card, Spinner } from '@heroui/react'
import clsx from 'clsx'
import { isEmpty, map } from 'es-toolkit/compat'
import { CircleCheck, CircleX } from 'lucide-react'
import { FC } from 'react'

interface BackendStepRowsProps {
  rows: BackendStepRow[]
}

/** Setup messages in order, each with its state and time. */
export const BackendStepRows: FC<BackendStepRowsProps> = ({ rows }) => {
  return (
    <Card>
      <Card.Content className="flex flex-col gap-0 py-2">
        {isEmpty(rows) && (
          <p className="py-2 text-sm text-muted">
            Waiting for the setup to start…
          </p>
        )}
        {map(rows, (row) => (
          <div
            key={row.id}
            className={clsx(
              'flex items-center gap-4 border-b',
              'border-separator py-2 last:border-b-0'
            )}
          >
            {row.state === BackendStepRowState.DONE && (
              <CircleCheck
                size={16}
                className="shrink-0 text-success"
                aria-label="Done"
              />
            )}
            {row.state === BackendStepRowState.RUNNING && (
              <Spinner size="sm" color="warning" aria-label="Running" />
            )}
            {row.state === BackendStepRowState.FAILED && (
              <CircleX
                size={16}
                className="shrink-0 text-danger"
                aria-label="Failed"
              />
            )}
            <span
              className={clsx('min-w-0 flex-1 text-sm', {
                'text-danger': row.state === BackendStepRowState.FAILED
              })}
            >
              {row.message}
            </span>
            <span className="font-mono text-xs text-muted">{row.time}</span>
          </div>
        ))}
      </Card.Content>
    </Card>
  )
}
