import { GeneratorConfigFormValues } from '@/features/generator-configs/types/generator-config'

export const FORM_DEFAULT_VALUES: GeneratorConfigFormValues = {
  cfg_scale: 7.5,
  clip_skip: 1,
  height: 512,
  loras: [],
  negative_prompt: '',
  number_of_images: 4,
  prompt: '',
  sampler: 'EULER_A',
  seed: -1,
  steps: 24,
  styles: [],
  width: 512
}
