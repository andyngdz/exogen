import { Button, Tooltip } from '@heroui/react'
import clsx from 'clsx'
import { FC, ReactNode } from 'react'

export interface AppRailItemProps {
  label: string
  icon: ReactNode
  isActive?: boolean
  indicator?: ReactNode
  onPress?: VoidFunction
}

/** An icon-only rail button; the label shows as a tooltip and names it for screen readers. */
export const AppRailItem: FC<AppRailItemProps> = ({
  label,
  icon,
  isActive = false,
  indicator,
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
          'relative size-10 rounded-xl',
          isActive ? 'bg-accent-soft text-accent-soft-foreground' : 'text-muted'
        )}
      >
        {icon}
        {indicator && (
          <span className="absolute top-2 right-2 flex">{indicator}</span>
        )}
      </Button>
      <Tooltip.Content placement="right">{label}</Tooltip.Content>
    </Tooltip>
  )
}
