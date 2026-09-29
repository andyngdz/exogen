'use client'

import { Button, Card } from '@heroui/react'
import { Copy } from 'lucide-react'
import { FC } from 'react'
import { useCopyToClipboard } from 'react-use'

export interface SuggestedCommandSnippetProps {
  command: string
}

export const SuggestedCommandSnippet: FC<SuggestedCommandSnippetProps> = ({
  command
}) => {
  const [, copyToClipboard] = useCopyToClipboard()

  return (
    <Card className="bg-default">
      <Card.Content className="flex flex-row items-center gap-2">
        <code className="flex-1 font-mono text-sm text-muted">{command}</code>
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          aria-label="Copy command"
          onPress={() => copyToClipboard(command)}
        >
          <Copy size={16} />
        </Button>
      </Card.Content>
    </Card>
  )
}
