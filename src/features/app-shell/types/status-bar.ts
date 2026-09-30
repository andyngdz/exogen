export enum StatusTone {
  SUCCESS = 'success',
  WARNING = 'warning',
  DANGER = 'danger'
}

export interface BackendStatusView {
  label: string
  tone: StatusTone
}

export interface UsageView {
  /** 0 to 100. */
  percent: number
  label: string
}

export interface DownloadView extends UsageView {
  modelId: string
}
