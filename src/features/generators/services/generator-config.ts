import { GeneratorConfigFormValues } from '@/features/generator-configs'
import { clamp } from 'es-toolkit'

const NUMBER_OF_IMAGES_RANGE = [1, 8] as const
const STEPS_RANGE = [1, 100] as const
const CFG_SCALE_RANGE = [1, 30] as const

export class GeneratorConfigService {
  /**
   * Keeps values inside the inspector sliders' ranges. Runs wherever values
   * enter the form (saved values, history reuse), so a submit never sends a
   * value the slider cannot show.
   */
  clampFormValues(
    values: GeneratorConfigFormValues
  ): GeneratorConfigFormValues {
    return {
      ...values,
      number_of_images: clamp(
        values.number_of_images,
        ...NUMBER_OF_IMAGES_RANGE
      ),
      steps: clamp(values.steps, ...STEPS_RANGE),
      cfg_scale: clamp(values.cfg_scale, ...CFG_SCALE_RANGE)
    }
  }
}

export const generatorConfigService = new GeneratorConfigService()
