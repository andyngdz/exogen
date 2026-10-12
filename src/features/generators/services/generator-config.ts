import { GeneratorConfigFormValues } from '@/features/generator-configs'
import { FORM_DEFAULT_VALUES } from '@/features/generators/constants/generator'
import { clamp } from 'es-toolkit'

const NUMBER_OF_IMAGES_RANGE = [1, 8] as const
const STEPS_RANGE = [1, 100] as const
const CFG_SCALE_RANGE = [1, 30] as const

export class GeneratorConfigService {
  /**
   * Keeps values inside the inspector sliders' ranges. Runs wherever values
   * enter the form (saved values, history reuse), so a submit never sends a
   * value the slider cannot show. A missing or broken size falls back to
   * the default.
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
      cfg_scale: clamp(values.cfg_scale, ...CFG_SCALE_RANGE),
      width: this.toValidSize(values.width, FORM_DEFAULT_VALUES.width),
      height: this.toValidSize(values.height, FORM_DEFAULT_VALUES.height)
    }
  }

  // Saved values go through JSON, so a NaN size comes back as null.
  private toValidSize(size: number, fallback: number) {
    if (Number.isFinite(size) && size > 0) return size
    return fallback
  }
}

export const generatorConfigService = new GeneratorConfigService()
