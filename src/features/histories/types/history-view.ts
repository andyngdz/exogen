import type { HistoryItem } from '@/types'

export interface HistoryDay {
  label: string
  runs: HistoryItem[]
}

export interface HistoryConfigRow {
  label: string
  value: string
  isMono: boolean
}
