import { describe, expect, it } from 'vitest'
import { FORM_DEFAULT_VALUES } from '../generator'

describe('Generator Constants', () => {
  describe('FORM_DEFAULT_VALUES', () => {
    it('should have the correct default values', () => {
      expect(FORM_DEFAULT_VALUES).toEqual({
        width: 512,
        height: 512,
        number_of_images: 4,
        steps: 24,
        seed: -1,
        cfg_scale: 7.5,
        clip_skip: 1,
        sampler: 'EULER_A',
        styles: [],
        loras: [],
        prompt: '',
        negative_prompt: ''
      })
    })

    it('should have all required fields from GeneratorConfigFormValues', () => {
      // Test that all required fields are present
      const requiredFields = [
        'width',
        'height',
        'number_of_images',
        'steps',
        'seed',
        'cfg_scale',
        'clip_skip',
        'sampler',
        'styles',
        'loras',
        'prompt',
        'negative_prompt'
      ]

      requiredFields.forEach((field) => {
        expect(FORM_DEFAULT_VALUES).toHaveProperty(field)
      })
    })

    it('should have numeric values for numeric fields', () => {
      expect(typeof FORM_DEFAULT_VALUES.width).toBe('number')
      expect(typeof FORM_DEFAULT_VALUES.height).toBe('number')
      expect(typeof FORM_DEFAULT_VALUES.number_of_images).toBe('number')
      expect(typeof FORM_DEFAULT_VALUES.steps).toBe('number')
      expect(typeof FORM_DEFAULT_VALUES.seed).toBe('number')
      expect(typeof FORM_DEFAULT_VALUES.cfg_scale).toBe('number')
      expect(typeof FORM_DEFAULT_VALUES.clip_skip).toBe('number')
    })

    it('should have empty strings for prompt fields', () => {
      expect(FORM_DEFAULT_VALUES.prompt).toBe('')
      expect(FORM_DEFAULT_VALUES.negative_prompt).toBe('')
    })

    it('should have empty array for styles', () => {
      expect(Array.isArray(FORM_DEFAULT_VALUES.styles)).toBe(true)
      expect(FORM_DEFAULT_VALUES.styles.length).toBe(0)
    })

    it('should have empty array for loras', () => {
      expect(Array.isArray(FORM_DEFAULT_VALUES.loras)).toBe(true)
      expect(FORM_DEFAULT_VALUES.loras.length).toBe(0)
    })

    it('should not have hires_fix by default (applied lazily when enabled)', () => {
      expect(FORM_DEFAULT_VALUES.hires_fix).toBeUndefined()
    })
  })
})
