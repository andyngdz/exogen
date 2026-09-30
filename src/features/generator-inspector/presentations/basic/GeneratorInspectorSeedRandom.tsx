import { useGeneratorConfigSeed } from '@/features/generator-config-seed/states/useGeneratorConfigSeed'
import { Switch } from '@heroui/react'

export const GeneratorInspectorSeedRandom = () => {
  const { isRandomSeed, onRandomSeedChange } = useGeneratorConfigSeed()

  return (
    <Switch size="sm" isSelected={isRandomSeed} onChange={onRandomSeedChange}>
      <Switch.Content className="text-xs text-muted">
        Random
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
      </Switch.Content>
    </Switch>
  )
}
