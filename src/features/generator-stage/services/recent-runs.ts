import { RecentRun } from '@/features/generator-stage/types'
import { dateFormatter } from '@/services/date-formatter'
import { HistoryItem } from '@/types'
import { first, map, orderBy, take } from 'es-toolkit/compat'

const RANDOM_SEED = -1

export class RecentRunService {
  /** The newest history runs (the API lists oldest first), each with a thumbnail and a summary line. */
  toRecentRuns(
    histories: HistoryItem[],
    baseURL: string,
    limit: number
  ): RecentRun[] {
    const newestFirst = orderBy(histories, ['created_at'], ['desc'])

    return map(take(newestFirst, limit), (history) => {
      const image = first(history.generated_images)
      const count = history.generated_images.length

      return {
        history,
        ...(image && { thumbnailUrl: `${baseURL}/${image.path}` }),
        metaLabel: [
          dateFormatter.time(history.created_at),
          count === 1 ? '1 image' : `${count} images`,
          this.toSeedLabel(history.config.seed)
        ].join(' · '),
        prompt: history.prompt
      }
    })
  }

  private toSeedLabel(seed: number) {
    if (seed === RANDOM_SEED) return 'random seed'
    return `seed ${seed}`
  }
}

export const recentRunService = new RecentRunService()
