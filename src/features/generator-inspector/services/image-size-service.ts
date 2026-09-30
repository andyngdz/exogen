import {
  ImageSize,
  ImageSizePreset,
  RatioPreset
} from '@/features/generator-inspector/types'
import { ModelFamily } from '@/types'
import { find, values } from 'es-toolkit/compat'

const RATIO_PRESETS: RatioPreset[] = [
  ImageSizePreset.SQUARE,
  ImageSizePreset.LANDSCAPE,
  ImageSizePreset.PORTRAIT,
  ImageSizePreset.WIDE
]

const RATIOS: Record<RatioPreset, [number, number]> = {
  [ImageSizePreset.SQUARE]: [1, 1],
  [ImageSizePreset.LANDSCAPE]: [4, 3],
  [ImageSizePreset.PORTRAIT]: [3, 4],
  [ImageSizePreset.WIDE]: [16, 9]
}

// The edge length each family was trained at; presets keep its pixel count.
const BASE_EDGES: Record<ModelFamily, number> = {
  [ModelFamily.SD15]: 512,
  [ModelFamily.SD2]: 768,
  [ModelFamily.SDXL]: 1024,
  [ModelFamily.SD3]: 1024,
  [ModelFamily.FLUX]: 1024,
  [ModelFamily.UNKNOWN]: 512
}

const SIZE_STEP = 64

const roundToStep = (value: number) => Math.round(value / SIZE_STEP) * SIZE_STEP

export class ImageSizeService {
  readonly presets = RATIO_PRESETS

  /** Size for a ratio preset that keeps the family's base pixel count, rounded to 64. */
  getPresetSize(family: ModelFamily, preset: RatioPreset): ImageSize {
    const base = BASE_EDGES[family]
    const [ratioWidth, ratioHeight] = RATIOS[preset]

    return {
      width: roundToStep(base * Math.sqrt(ratioWidth / ratioHeight)),
      height: roundToStep(base * Math.sqrt(ratioHeight / ratioWidth))
    }
  }

  /** Compact size text: 1024² for a square, 1152 × 896 otherwise. */
  toSizeLabel({ width, height }: ImageSize) {
    if (width === height) return `${width}²`
    return `${width} × ${height}`
  }

  /** Text shown on a preset's toggle. */
  getPresetLabel(preset: ImageSizePreset) {
    if (preset === ImageSizePreset.CUSTOM) return 'Custom'
    return preset
  }

  /** Narrows a selection key to a preset; undefined for anything else. */
  parsePreset(key: unknown) {
    return find(values(ImageSizePreset), (preset) => preset === key)
  }

  /** The preset whose size equals the given one for this family, or CUSTOM. */
  findPreset(family: ModelFamily, size: ImageSize): ImageSizePreset {
    const match = find(RATIO_PRESETS, (preset) => {
      const presetSize = this.getPresetSize(family, preset)
      return (
        presetSize.width === size.width && presetSize.height === size.height
      )
    })

    return match ?? ImageSizePreset.CUSTOM
  }
}

export const imageSizeService = new ImageSizeService()
