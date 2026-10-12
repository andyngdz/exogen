export enum ImageSizePreset {
  SQUARE = '1:1',
  LANDSCAPE = '4:3',
  PORTRAIT = '3:4',
  WIDE = '16:9',
  CUSTOM = 'custom'
}

export type RatioPreset = Exclude<ImageSizePreset, ImageSizePreset.CUSTOM>

export interface ImageSize {
  width: number
  height: number
}
