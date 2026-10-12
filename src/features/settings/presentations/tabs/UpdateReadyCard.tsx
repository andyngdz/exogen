import { Button, Card } from '@heroui/react'
import clsx from 'clsx'
import { Download, RotateCcw } from 'lucide-react'
import { FC } from 'react'

interface UpdateReadyCardProps {
  version: string
  onLater: VoidFunction
  onInstall: VoidFunction
}

/** A downloaded update waiting for the user to restart into it. */
export const UpdateReadyCard: FC<UpdateReadyCardProps> = ({
  version,
  onLater,
  onInstall
}) => {
  return (
    <Card>
      <Card.Content className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span
            className={clsx(
              'flex size-10 shrink-0 items-center justify-center',
              'rounded-xl bg-accent-soft text-accent-soft-foreground'
            )}
          >
            <Download size={18} />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="font-medium">
              ExoGen {version} is ready to install
            </span>
            <span className="text-sm text-muted">
              Downloaded in the background. Installing restarts the app and the
              backend.
            </span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onPress={onLater}>
            Later
          </Button>
          <Button variant="primary" onPress={onInstall}>
            <RotateCcw size={16} />
            Install and restart
          </Button>
        </div>
      </Card.Content>
    </Card>
  )
}
