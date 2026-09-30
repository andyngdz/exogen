import { GeneratorConfigHiresFix } from '@/features/generator-config-hires/presentations/GeneratorConfigHiresFix'
import { useGeneratorConfigFormats } from '@/features/generator-config-formats/states'
import { InspectorSection } from '@/features/generator-inspector/presentations/InspectorSection'
import { useHiresOutputSize } from '@/features/generator-inspector/states/useHiresOutputSize'
import { Switch } from '@heroui/react'

export const GeneratorInspectorHires = () => {
  const { isHiresFixEnabled, onHiresFixToggle } = useGeneratorConfigFormats()
  const { baseLabel, outputLabel } = useHiresOutputSize()

  return (
    <div>
      <InspectorSection title="Hires fix">
        <Switch isSelected={isHiresFixEnabled} onChange={onHiresFixToggle}>
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            Upscale, then redraw fine detail in a second pass
          </Switch.Content>
        </Switch>
      </InspectorSection>
      {isHiresFixEnabled && (
        <InspectorSection title="Second pass">
          <GeneratorConfigHiresFix />
          {outputLabel && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">Output size</span>
              <span className="font-mono tabular-nums">
                {baseLabel} → {outputLabel}
              </span>
            </div>
          )}
        </InspectorSection>
      )}
    </div>
  )
}
