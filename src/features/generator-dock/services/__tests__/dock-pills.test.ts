import { UpscaleFactor, UpscalerType } from '@/cores/constants'
import { DockPillInput, DockPillKind } from '@/features/generator-dock/types'
import { ImageSizePreset } from '@/features/generator-inspector/types'
import { map } from 'es-toolkit/compat'
import { describe, expect, it } from 'vitest'
import { dockPillService } from '../dock-pills'

const baseInput: DockPillInput = {
  values: {
    width: 1024,
    height: 1024,
    number_of_images: 4,
    steps: 30,
    cfg_scale: 7,
    seed: 2847193650,
    hires_fix: {
      upscale_factor: UpscaleFactor.TWO,
      upscaler: UpscalerType.REAL_ESRGAN_X2_PLUS,
      denoising_strength: 0.35,
      steps: 0
    }
  },
  sizePreset: ImageSizePreset.SQUARE,
  samplerName: 'DPM++ 2M',
  isHiresFixEnabled: false,
  isImageMode: false,
  denoisingStrength: 0.75,
  loras: [],
  styleNames: []
}

const labels = (input: DockPillInput) =>
  map(dockPillService.toPills(input), 'label')

describe('dockPillService', () => {
  it('summarizes size, images, sampling and seed', () => {
    expect(labels(baseInput)).toEqual([
      '1:1 · 1024 × 1024',
      '4 images',
      'DPM++ 2M · 30 steps · CFG 7',
      'Seed 2847193650'
    ])
  })

  it('shows a custom size without a ratio, one image and a random seed', () => {
    expect(
      labels({
        ...baseInput,
        values: {
          ...baseInput.values,
          width: 1000,
          height: 704,
          number_of_images: 1,
          seed: -1
        },
        sizePreset: ImageSizePreset.CUSTOM
      })
    ).toEqual([
      '1000 × 704',
      '1 image',
      'DPM++ 2M · 30 steps · CFG 7',
      'Random seed'
    ])
  })

  it('adds hires, LoRAs and styles after the seed', () => {
    const pills = dockPillService.toPills({
      ...baseInput,
      isHiresFixEnabled: true,
      loras: [{ name: 'add-detail-xl', weight: 0.8 }],
      styleNames: ['Cinematic']
    })

    expect(map(pills, 'kind').slice(-3)).toEqual([
      DockPillKind.HIRES,
      DockPillKind.LORA,
      DockPillKind.STYLE
    ])
    expect(map(pills, 'label').slice(-3)).toEqual([
      'Hires ×2',
      'add-detail-xl 0.8',
      'Cinematic'
    ])
  })

  it('adds denoise after the size in image mode', () => {
    expect(labels({ ...baseInput, isImageMode: true }).slice(0, 2)).toEqual([
      '1:1 · 1024 × 1024',
      'Denoise 0.75'
    ])
  })
})
