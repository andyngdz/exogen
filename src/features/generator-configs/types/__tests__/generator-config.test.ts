import { describe, expect, it } from 'vitest'
import { GeneratorConfigFormValues } from '../generator-config'

describe('GeneratorConfigFormValues', () => {
  it('should have the correct type structure', () => {
    const configValues: GeneratorConfigFormValues = {
      width: 512,
      height: 512,

      loras: [],
      number_of_images: 4,
      steps: 24,
      seed: -1,
      cfg_scale: 7.5,
      clip_skip: 2,
      sampler: 'EULER_A',
      negative_prompt: '',
      prompt: '',
      styles: []
    }

    // TypeScript compilation validates the type
    expect(configValues).toBeDefined()
    expect(configValues.width).toBe(512)
    expect(configValues.height).toBe(512)
    expect(configValues.hires_fix).toBe(false)
    expect(configValues.number_of_images).toBe(4)
    expect(configValues.steps).toBe(24)
    expect(configValues.seed).toBe(-1)
    expect(configValues.cfg_scale).toBe(7.5)
    expect(configValues.clip_skip).toBe(2)
  })
})
