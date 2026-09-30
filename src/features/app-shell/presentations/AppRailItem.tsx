import { Button, Tooltip } from '@heroui/react'
import clsx from 'clsx'
import { FC, ReactNode } from 'react'

export interface AppRailItemProps {
  label: string
  icon: ReactNode
  isActive?: boolean
  onPress?: VoidFunction
}

/** An icon-only rail button; the label shows as a tooltip and names it for screen readers. */
export const AppRailItem: FC<AppRailItemProps> = ({
  label,
  icon,
  isActive = false,
  onPress
}) => {
  return (
    <Tooltip delay={300}>
      <Button
        isIconOnly
        variant="ghost"
        aria-label={label}
        aria-pressed={isActive}
        onPress={onPress}
        className={clsx(
          'size-10 rounded-xl',
          isActive ? 'bg-accent-soft text-accent-soft-foreground' : 'text-muted'
        )}
      >
        {icon}
      </Button>
      <Tooltip.Content placement="right">{label}</Tooltip.Content>
    </Tooltip>
  )
}
