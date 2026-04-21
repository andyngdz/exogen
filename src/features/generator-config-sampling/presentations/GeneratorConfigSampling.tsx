import { NumberInputController } from '@/cores/presentations/NumberInputController'
import { GeneratorConfigFormValues } from '@/features/generator-configs/types/generator-config'
import { useFormContext } from 'react-hook-form'
import { GeneratorConfigCommonSteps } from './GeneratorConfigCommonSteps'
import { GeneratorConfigSamplerDropdown } from './GeneratorConfigSamplerDropdown'

export const GeneratorConfigSampling = () => {
  const { control } = useFormContext<GeneratorConfigFormValues>()

  return (
    <div className="flex flex-col gap-4 p-4">
      <span className="font-semibold text-sm">Sampling</span>
      <GeneratorConfigSamplerDropdown />
      <div className="flex gap-4">
        <NumberInputController
          aria-label="Steps"
          control={control}
          controlName="steps"
          minValue={1}
          startContent={<span className="text-sm text-default-700">Steps</span>}
        />
        <GeneratorConfigCommonSteps />
      </div>
      <NumberInputController
        aria-label="CFG Scale"
        control={control}
        controlName="cfg_scale"
        maximumFractionDigits={2}
        minValue={1}
        startContent={
          <span className="text-sm text-default-700 min-w-fit">CFG Scale</span>
        }
      />
      <NumberInputController
        aria-label="CLIP Skip"
        control={control}
        controlName="clip_skip"
        minValue={1}
        maxValue={12}
        startContent={
          <span className="text-sm text-default-700 min-w-fit">CLIP Skip</span>
        }
      />
    </div>
  )
}
