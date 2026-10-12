import { ModelFamily } from '@/types'
import { describe, expect, it } from 'vitest'
import { ImageSizePreset } from '@/features/generator-inspector/types'
import { imageSizeService } from '../image-size-service'

describe('imageSizeService', () => {
  it.each([
    [ModelFamily.SDXL, ImageSizePreset.SQUARE, 1024, 1024],
    [ModelFamily.SDXL, ImageSizePreset.LANDSCAPE, 1152, 896],
    [ModelFamily.SDXL, ImageSizePreset.PORTRAIT, 896, 1152],
    [ModelFamily.SDXL, ImageSizePreset.WIDE, 1344, 768],
    [ModelFamily.SD3, ImageSizePreset.WIDE, 1344, 768],
    [ModelFamily.FLUX, ImageSizePreset.SQUARE, 1024, 1024],
    [ModelFamily.SD2, ImageSizePreset.SQUARE, 768, 768],
    [ModelFamily.SD2, ImageSizePreset.LANDSCAPE, 896, 640],
    [ModelFamily.SD15, ImageSizePreset.SQUARE, 512, 512],
    [ModelFamily.SD15, ImageSizePreset.LANDSCAPE, 576, 448],
    [ModelFamily.SD15, ImageSizePreset.WIDE, 704, 384],
    [ModelFamily.UNKNOWN, ImageSizePreset.SQUARE, 512, 512]
  ] as const)('%s %s is %i x %i', (family, preset, width, height) => {
    expect(imageSizeService.getPresetSize(family, preset)).toEqual({
      width,
      height
    })
  })

  it('keeps every preset a multiple of 64', () => {
    for (const family of Object.values(ModelFamily)) {
      for (const preset of imageSizeService.presets) {
        const { width, height } = imageSizeService.getPresetSize(family, preset)
        expect(width % 64).toBe(0)
        expect(height % 64).toBe(0)
      }
    }
  })

  it('finds the preset that matches a size', () => {
    expect(
      imageSizeService.findPreset(ModelFamily.SDXL, {
        width: 1152,
        height: 896
      })
    ).toBe(ImageSizePreset.LANDSCAPE)
  })

  it('returns CUSTOM for a size that matches no preset of the family', () => {
    expect(
      imageSizeService.findPreset(ModelFamily.SDXL, {
        width: 1000,
        height: 700
      })
    ).toBe(ImageSizePreset.CUSTOM)
    expect(
      imageSizeService.findPreset(ModelFamily.SD15, {
        width: 1024,
        height: 1024
      })
    ).toBe(ImageSizePreset.CUSTOM)
  })

  it('labels a square size with a superscript and others with both edges', () => {
    expect(imageSizeService.toSizeLabel({ width: 1024, height: 1024 })).toBe(
      '1024²'
    )
    expect(imageSizeService.toSizeLabel({ width: 1152, height: 896 })).toBe(
      '1152 × 896'
    )
  })
})
