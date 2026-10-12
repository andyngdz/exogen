import { useStageActions } from '@/features/generator-stage/states/useStageActions'
import { StagePanelTone } from '@/features/generator-stage/types'
import { Button } from '@heroui/react'
import { Box, Search } from 'lucide-react'
import { GeneratorStagePanel } from './GeneratorStagePanel'

export const GeneratorStageNoModel = () => {
  const { onOpenModelSearch } = useStageActions()

  return (
    <GeneratorStagePanel
      icon={<Box size={18} />}
      tone={StagePanelTone.ACCENT}
      title="Select a model"
      description="Pick a downloaded model from the model menu above, or find one to download."
    >
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onPress={onOpenModelSearch}>
          <Search size={14} />
          Find models
        </Button>
      </div>
    </GeneratorStagePanel>
  )
}
