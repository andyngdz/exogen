import { SliderController } from '@/cores/presentations/SliderController'
import { useGeneratorConfigImg2Img } from '@/features/generator-config-img2img/states/useGeneratorConfigImg2Img'
import { GeneratorConfigFormValues } from '@/features/generator-configs'
import { InspectorSection } from '@/features/generator-inspector/presentations/InspectorSection'
import { GeneratorInspectorImg2Img } from './GeneratorInspectorImg2Img'
import { GeneratorInspectorSampling } from './GeneratorInspectorSampling'
import { GeneratorInspectorSeed } from './GeneratorInspectorSeed'
import { GeneratorInspectorSeedRandom } from './GeneratorInspectorSeedRandom'
import { GeneratorInspectorSize } from './GeneratorInspectorSize'

export const GeneratorInspectorBasic = () => {
  const { isImage2Image } = useGeneratorConfigImg2Img()

  return (
    <div>
      {isImage2Image && (
        <InspectorSection title="Input image">
          <GeneratorInspectorImg2Img />
        </InspectorSection>
      )}
      <InspectorSection title="Size">
        <GeneratorInspectorSize />
        <SliderController<GeneratorConfigFormValues>
          controlName="number_of_images"
          label="Images per run"
          minValue={1}
          maxValue={8}
          step={1}
        />
      </InspectorSection>
      <InspectorSection title="Sampler">
        <GeneratorInspectorSampling />
      </InspectorSection>
      <InspectorSection
        title="Seed"
        titleAction={<GeneratorInspectorSeedRandom />}
      >
        <GeneratorInspectorSeed />
      </InspectorSection>
    </div>
  )
}
