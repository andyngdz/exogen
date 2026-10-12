'use client'

import { useBackendStepCommands } from '@/features/health-check/states/useBackendStepCommands'
import { Card } from '@heroui/react'
import { map } from 'es-toolkit/compat'
import { SuggestedCommandSnippet } from './SuggestedCommandSnippet'

/** The commands the failed setup suggests, each with a copy button. */
export const BackendStepCommands = () => {
  const commands = useBackendStepCommands()

  return (
    <Card>
      <Card.Content className="flex flex-col gap-4">
        <span className="text-xs font-medium text-muted">
          Suggested command
        </span>
        {map(commands, (command) => (
          <div key={command.command} className="flex flex-col gap-2">
            <span className="text-xs text-muted">{command.label}</span>
            <SuggestedCommandSnippet command={command.command} />
          </div>
        ))}
      </Card.Content>
    </Card>
  )
}
