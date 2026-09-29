import { NumberInputController } from '@/cores/presentations/NumberInputController'
import { GeneratorConfigFormValues } from '@/features/generator-configs/types/generator-config'
import { GeneratorConfigCommonSteps } from './GeneratorConfigCommonSteps'
import { GeneratorConfigSamplerDropdown } from './GeneratorConfigSamplerDropdown'

export const GeneratorConfigSampling = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <span className="font-semibold text-sm">Sampling</span>
      <GeneratorConfigSamplerDropdown />
      <div className="flex gap-4">
        <NumberInputController<GeneratorConfigFormValues>
          aria-label="Steps"
          controlName="steps"
          minValue={1}
          startContent={<span className="text-sm text-foreground">Steps</span>}
        />
        <GeneratorConfigCommonSteps />
      </div>
      <NumberInputController<GeneratorConfigFormValues>
        aria-label="CFG Scale"
        controlName="cfg_scale"
        maximumFractionDigits={2}
        minValue={1}
        startContent={
          <span className="text-sm text-foreground min-w-fit">CFG Scale</span>
        }
      />
      <NumberInputController<GeneratorConfigFormValues>
        aria-label="CLIP Skip"
        controlName="clip_skip"
        minValue={1}
        maxValue={12}
        startContent={
          <span className="text-sm text-foreground min-w-fit">CLIP Skip</span>
        }
      />
    </div>
  )
}
