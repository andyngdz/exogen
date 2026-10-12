import { NumberInputController } from '@/cores/presentations/NumberInputController'
import { SliderController } from '@/cores/presentations/SliderController'
import { GeneratorConfigCommonSteps } from '@/features/generator-config-sampling/presentations/GeneratorConfigCommonSteps'
import { GeneratorConfigSamplerDropdown } from '@/features/generator-config-sampling/presentations/GeneratorConfigSamplerDropdown'
import { GeneratorConfigFormValues } from '@/features/generator-configs'

export const GeneratorInspectorSampling = () => {
  return (
    <div className="flex flex-col gap-4">
      <GeneratorConfigSamplerDropdown />
      <div className="flex flex-col gap-2">
        <SliderController<GeneratorConfigFormValues>
          controlName="steps"
          label="Steps"
          minValue={1}
          maxValue={100}
          step={1}
        />
        <GeneratorConfigCommonSteps />
      </div>
      <SliderController<GeneratorConfigFormValues>
        controlName="cfg_scale"
        label="CFG scale"
        minValue={1}
        maxValue={30}
        step={0.5}
      />
      <NumberInputController<GeneratorConfigFormValues>
        aria-label="CLIP skip"
        controlName="clip_skip"
        minValue={1}
        maxValue={12}
        startContent={<span className="text-sm text-muted">CLIP skip</span>}
      />
    </div>
  )
}
