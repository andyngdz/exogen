import type { GeneratorConfigFormValues } from '@/features/generator-configs'

export const generatorConfigFormDefaults = (
  overrides: Partial<GeneratorConfigFormValues> = {}
): GeneratorConfigFormValues => {
  return {
    cfg_scale: 7,
    clip_skip: 1,
    height: 512,
    loras: [],
    negative_prompt: '',
    number_of_images: 1,
    prompt: '',
    sampler: 'Euler',
    seed: 0,
    steps: 20,
    styles: [],
    width: 512,
    ...overrides
  }
}
