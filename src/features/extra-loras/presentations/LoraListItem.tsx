import { formatter } from '@/services/formatter'
import { LoRA } from '@/types'
import { Card, Switch } from '@heroui/react'
import clsx from 'clsx'
import { FC } from 'react'
import { usePress } from 'react-aria'

interface LoraListItemProps {
  lora: LoRA
  isSelected: boolean
  onSelect: VoidFunction
}

export const LoraListItem: FC<LoraListItemProps> = ({
  lora,
  isSelected,
  onSelect
}) => {
  const { pressProps } = usePress({ onPress: onSelect })

  return (
    <Card
      {...pressProps}
      role="button"
      tabIndex={0}
      className={clsx('cursor-pointer', {
        'bg-default': isSelected
      })}
    >
      <Card.Content className="flex flex-row items-center justify-between gap-2 p-2">
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-sm truncate block">
            {lora.name}
          </span>
          <div className="text-xs text-muted">
            {formatter.bytes(lora.file_size, 0)}
          </div>
        </div>

        <Switch
          aria-label={`Toggle ${lora.name}`}
          size="sm"
          isSelected={isSelected}
          onChange={onSelect}
        >
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch.Content>
        </Switch>
      </Card.Content>
    </Card>
  )
}
