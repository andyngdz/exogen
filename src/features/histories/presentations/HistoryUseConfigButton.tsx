import { useUseConfig } from '@/features/histories/states/useUseConfig'
import { HistoryItem } from '@/types'
import { Button, Tooltip } from '@heroui/react'
import { Bolt } from 'lucide-react'
import { FC } from 'react'

export interface HistoryUseConfigButtonProps {
  history: HistoryItem
}

export const HistoryUseConfigButton: FC<HistoryUseConfigButtonProps> = ({
  history
}) => {
  const { onUseConfig } = useUseConfig(history)

  return (
    <Tooltip delay={0}>
      <Button
        isIconOnly
        variant="ghost"
        size="sm"
        aria-label="Use this config"
        onPress={onUseConfig}
      >
        <Bolt className="text-foreground" size={16} />
      </Button>
      <Tooltip.Content>Use this config</Tooltip.Content>
    </Tooltip>
  )
}
