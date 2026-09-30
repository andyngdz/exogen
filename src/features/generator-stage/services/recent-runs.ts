import { RecentRun } from '@/features/generator-stage/types'
import { dateFormatter } from '@/services/date-formatter'
import { HistoryItem } from '@/types'
import { first, map, take } from 'es-toolkit/compat'

export class RecentRunService {
  /** The newest history runs, with a thumbnail and a one-line summary each. */
  toRecentRuns(
    histories: HistoryItem[],
    baseURL: string,
    limit: number
  ): RecentRun[] {
    return map(take(histories, limit), (history) => {
      const image = first(history.generated_images)
      const count = history.generated_images.length

      return {
        history,
        ...(image && { thumbnailUrl: `${baseURL}/${image.path}` }),
        metaLabel: [
          dateFormatter.time(history.created_at),
          count === 1 ? '1 image' : `${count} images`,
          `seed ${history.config.seed}`
        ].join(' · '),
        prompt: history.prompt
      }
    })
  }
}

export const recentRunService = new RecentRunService()
