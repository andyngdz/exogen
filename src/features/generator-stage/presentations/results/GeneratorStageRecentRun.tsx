import { RecentRun } from '@/features/generator-stage/types'
import { useUseConfig } from '@/features/histories/states'
import { Button, Popover } from '@heroui/react'
import { RotateCcw } from 'lucide-react'
import NextImage from 'next/image'
import { FC } from 'react'

interface GeneratorStageRecentRunProps {
  recentRun: RecentRun
}

export const GeneratorStageRecentRun: FC<GeneratorStageRecentRunProps> = ({
  recentRun
}) => {
  const { onUseConfig } = useUseConfig(recentRun.history)

  return (
    <Popover>
      <Button
        isIconOnly
        variant="ghost"
        aria-label={`Recent run: ${recentRun.prompt}`}
        className="relative size-12 overflow-hidden rounded-lg bg-surface p-0"
      >
        {recentRun.thumbnailUrl && (
          <NextImage
            src={recentRun.thumbnailUrl}
            alt=""
            fill
            className="object-cover"
          />
        )}
      </Button>
      <Popover.Content placement="top" className="w-75">
        <Popover.Dialog className="flex flex-col gap-2">
          <span className="font-mono text-xs text-muted">
            {recentRun.metaLabel}
          </span>
          <p className="text-sm">{recentRun.prompt}</p>
          <Button size="sm" variant="secondary" onPress={onUseConfig}>
            <RotateCcw size={14} />
            Use this config
          </Button>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  )
}
