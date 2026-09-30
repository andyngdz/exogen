import { useStageActions } from '@/features/generator-stage/states/useStageActions'
import { useStageFailure } from '@/features/generator-stage/states/useStageFailure'
import { StagePanelTone } from '@/features/generator-stage/types'
import { Button } from '@heroui/react'
import clsx from 'clsx'
import {
  MemoryStick,
  RotateCcw,
  SquareTerminal,
  TriangleAlert
} from 'lucide-react'
import { GeneratorStagePanel } from './GeneratorStagePanel'

export const GeneratorStageFailed = () => {
  const { title, message, onTryAgain, isTryAgainDisabled } = useStageFailure()
  const { onOpenLogs, onOpenMemorySettings } = useStageActions()

  return (
    <GeneratorStagePanel
      icon={<TriangleAlert size={18} />}
      tone={StagePanelTone.DANGER}
      title={title}
      description="Your prompt and settings are kept. If the GPU ran out of memory, lower the size or images per run, or give models more memory."
    >
      <p
        className={clsx(
          'rounded-xl bg-background px-4 py-2',
          'font-mono text-sm text-danger'
        )}
      >
        {message}
      </p>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="primary"
          isDisabled={isTryAgainDisabled}
          onPress={onTryAgain}
        >
          <RotateCcw size={14} />
          Try again
        </Button>
        <Button size="sm" variant="secondary" onPress={onOpenMemorySettings}>
          <MemoryStick size={14} />
          Memory settings
        </Button>
        <Button size="sm" variant="ghost" onPress={onOpenLogs}>
          <SquareTerminal size={14} />
          Logs
        </Button>
      </div>
    </GeneratorStagePanel>
  )
}
