import { SliderController } from '@/cores/presentations/SliderController'
import { useGeneratorConfigFormats } from '@/features/generator-config-formats/states'
import { GeneratorConfigHiresFixUpscaleFactor } from '@/features/generator-config-hires/presentations/GeneratorConfigHiresFixUpscaleFactor'
import { GeneratorConfigHiresFixUpscaler } from '@/features/generator-config-hires/presentations/GeneratorConfigHiresFixUpscaler'
import { GeneratorConfigFormValues } from '@/features/generator-configs'
import { InspectorSection } from '@/features/generator-inspector/presentations/InspectorSection'
import { useHiresOutputSize } from '@/features/generator-inspector/states/useHiresOutputSize'
import { Card, Switch } from '@heroui/react'

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
        <>
          <InspectorSection title="Upscaler">
            <GeneratorConfigHiresFixUpscaler />
            <GeneratorConfigHiresFixUpscaleFactor />
          </InspectorSection>
          <InspectorSection title="Second pass">
            <div className="flex flex-col gap-2">
              <SliderController<GeneratorConfigFormValues>
                controlName="hires_fix.steps"
                label="Hires steps"
                minValue={0}
                maxValue={100}
                step={1}
              />
              <span className="text-xs text-muted">
                0 uses the same number of steps as the base pass.
              </span>
            </div>
            <SliderController<GeneratorConfigFormValues>
              controlName="hires_fix.denoising_strength"
              label="Denoising strength"
              minValue={0}
              maxValue={1}
              step={0.05}
            />
            {outputLabel && (
              <Card variant="secondary">
                <Card.Content className="flex flex-row items-center justify-between gap-2 text-xs">
                  <span className="whitespace-nowrap text-muted">
                    Output size
                  </span>
                  <span className="font-mono whitespace-nowrap tabular-nums">
                    {baseLabel} → {outputLabel}
                  </span>
                </Card.Content>
              </Card>
            )}
          </InspectorSection>
        </>
      )}
    </div>
  )
}
