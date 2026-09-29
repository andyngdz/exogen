export interface MemoryOption {
  scaleFactor: number
  label: string
}

export interface MaxMemoryFormProps {
  gpuScaleFactor: number
  ramScaleFactor: number
}

export enum MemoryScaleFactorColor {
  SUCCESS = 'success',
  WARNING = 'warning',
  DANGER = 'danger'
}
