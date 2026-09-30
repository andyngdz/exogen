import { GenerateBlockReason } from '@/features/generators/types'
import { Button, Kbd, Spinner } from '@heroui/react'
import { Sparkles } from 'lucide-react'
import { FC, useMemo } from 'react'

interface GeneratorDockActionProps {
  isDisabled: boolean
  isGenerating: boolean
  disabledReason?: GenerateBlockReason
  onSubmit: VoidFunction
}

export const GeneratorDockAction: FC<GeneratorDockActionProps> = ({
  isDisabled,
  isGenerating,
  disabledReason,
  onSubmit
}) => {
  const ActionIcon = useMemo(() => {
    if (isGenerating) return <Spinner size="sm" color="current" />
    return <Sparkles size={16} />
  }, [isGenerating])

  return (
    <div className="flex flex-col items-end gap-2">
      {disabledReason && (
        <span className="text-xs text-muted">{disabledReason}</span>
      )}
      <div className="flex items-center gap-2">
        {!isDisabled && (
          <Kbd>
            <Kbd.Abbr keyValue="ctrl" />
            <Kbd.Abbr keyValue="enter" />
          </Kbd>
        )}
        <Button variant="primary" isDisabled={isDisabled} onPress={onSubmit}>
          {ActionIcon}
          {isGenerating ? 'Generating' : 'Generate'}
        </Button>
      </div>
    </div>
  )
}
