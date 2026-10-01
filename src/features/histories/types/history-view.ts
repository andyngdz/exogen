import type { HistoryItem } from '@/types'

export interface HistoryDay {
  label: string
  runs: HistoryItem[]
}

export enum HistoryConfigRowKind {
  TEXT = 'text',
  MONO = 'mono',
  CHIPS = 'chips'
}

export interface HistoryConfigRow {
  label: string
  kind: HistoryConfigRowKind
  values: string[]
}

/** Display names the config only stores as ids. */
export interface HistoryConfigNames {
  samplerName: string
  styleNames: string[]
  loraLabels: string[]
}
