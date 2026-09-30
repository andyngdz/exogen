import type { HistoryItem } from '@/types'

export interface RecentRun {
  history: HistoryItem
  thumbnailUrl?: string
  metaLabel: string
  prompt: string
}
