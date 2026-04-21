'use client'

import { ScrollShadow } from '@heroui/react'
import { isEmpty } from 'es-toolkit/compat'
import { FC } from 'react'
import type { BackendSetupStatusEntry } from '../states/useBackendSetupStatusStore'
import { BackendStatusItem } from './BackendStatusItem'

export interface BackendStatusListProps {
  statuses: BackendSetupStatusEntry[]
}

export const BackendStatusList: FC<BackendStatusListProps> = ({ statuses }) => {
  if (isEmpty(statuses)) {
    return (
      <div className="text-default-700 animate-pulse text-center">
        Waiting for backend status...
      </div>
    )
  }

  return (
    <ScrollShadow hideScrollBar className="max-h-80 pr-2 pb-6 text-sm">
      <div className="flex flex-col gap-1">
        {statuses.map((status, index) => (
          <BackendStatusItem
            key={status.id}
            status={status}
            isLast={index === statuses.length - 1}
          />
        ))}
      </div>
    </ScrollShadow>
  )
}
