'use client'

import { Separator } from '@heroui/react'
import type { BackendStatusCommand } from '@types'
import { map } from 'es-toolkit/compat'
import { FC } from 'react'
import { SuggestedCommandSnippet } from './SuggestedCommandSnippet'

export interface SuggestedCommandsProps {
  commands: BackendStatusCommand[]
}

export const SuggestedCommands: FC<SuggestedCommandsProps> = ({ commands }) => {
  return (
    <div className="flex flex-col gap-4">
      <Separator />
      <div className="text-xs uppercase tracking-wide text-muted">
        Suggested commands
      </div>
      <div className="flex flex-col gap-4">
        {map(commands, (command) => (
          <div key={command.command} className="flex felx-col gap-2">
            <div className="text-xs font-semibold text-muted">
              {command.label}
            </div>
            <SuggestedCommandSnippet command={command.command} />
          </div>
        ))}
      </div>
    </div>
  )
}
