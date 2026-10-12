import { useStageActions } from '@/features/generator-stage/states/useStageActions'
import { useStageOffline } from '@/features/generator-stage/states/useStageOffline'
import { StagePanelTone } from '@/features/generator-stage/types'
import { Button } from '@heroui/react'
import { RotateCcw, SquareTerminal, Unplug } from 'lucide-react'
import { GeneratorStagePanel } from './GeneratorStagePanel'

export const GeneratorStageOffline = () => {
  const { lastResponseLabel } = useStageOffline()
  const { onOpenLogs, onRetryConnection } = useStageActions()

  return (
    <GeneratorStagePanel
      icon={<Unplug size={18} />}
      tone={StagePanelTone.DANGER}
      title="Backend stopped responding"
      description="ExoGen lost its connection to the local server. Your prompt, settings and history are kept."
    >
      {lastResponseLabel && (
        <span className="font-mono text-xs text-muted">
          {lastResponseLabel}
        </span>
      )}
      <div className="flex items-center gap-2">
        <Button size="sm" variant="primary" onPress={onRetryConnection}>
          <RotateCcw size={14} />
          Retry now
        </Button>
        <Button size="sm" variant="secondary" onPress={onOpenLogs}>
          <SquareTerminal size={14} />
          Open logs
        </Button>
      </div>
    </GeneratorStagePanel>
  )
}
