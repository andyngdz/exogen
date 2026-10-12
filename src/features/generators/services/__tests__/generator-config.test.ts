import { FORM_DEFAULT_VALUES } from '@/features/generators/constants'
import { generatorConfigService } from '@/features/generators/services/generator-config'
import { describe, expect, it } from 'vitest'

describe('generatorConfigService.clampFormValues', () => {
  it('pulls values back into the slider ranges', () => {
    const clamped = generatorConfigService.clampFormValues({
      ...FORM_DEFAULT_VALUES,
      number_of_images: 12,
      steps: 150,
      cfg_scale: 40
    })

    expect(clamped).toMatchObject({
      number_of_images: 8,
      steps: 100,
      cfg_scale: 30
    })
  })

  it('leaves values inside the ranges unchanged', () => {
    expect(generatorConfigService.clampFormValues(FORM_DEFAULT_VALUES)).toEqual(
      FORM_DEFAULT_VALUES
    )
  })

  it('falls back to the default size when a saved size is broken', () => {
    const savedValues = JSON.parse(
      JSON.stringify({ ...FORM_DEFAULT_VALUES, width: NaN, height: NaN })
    )

    expect(generatorConfigService.clampFormValues(savedValues)).toMatchObject({
      width: FORM_DEFAULT_VALUES.width,
      height: FORM_DEFAULT_VALUES.height
    })
  })
})
