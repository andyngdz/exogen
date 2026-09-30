import { useStageHeroActions } from '@/features/generator-stage/states/useStageHeroActions'
import { Button, Toolbar } from '@heroui/react'
import { Download, ImageUp, Maximize2 } from 'lucide-react'
import { FC } from 'react'

interface GeneratorStageToolbarProps {
  index: number
}

export const GeneratorStageToolbar: FC<GeneratorStageToolbarProps> = ({
  index
}) => {
  const actions = useStageHeroActions(index)

  return (
    <Toolbar
      aria-label="Image actions"
      className="rounded-full bg-overlay shadow-overlay"
    >
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        aria-label="Use as input"
        isDisabled={!actions.isReady}
        isPending={actions.isUsingAsInput}
        onPress={actions.onUseAsInput}
      >
        <ImageUp size={16} />
      </Button>
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        aria-label="Download image"
        isDisabled={!actions.isReady}
        onPress={actions.onDownload}
      >
        <Download size={16} />
      </Button>
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        aria-label="Open full screen"
        isDisabled={!actions.isReady}
        onPress={actions.onOpenViewer}
      >
        <Maximize2 size={16} />
      </Button>
    </Toolbar>
  )
}
