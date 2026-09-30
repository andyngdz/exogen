import { HistoryConfigRow, HistoryDay } from '@/features/histories/types'
import { HistoryItem } from '@/types'
import dayjs, { Dayjs } from 'dayjs'
import {
  filter,
  groupBy,
  includes,
  map,
  orderBy,
  toLower
} from 'es-toolkit/compat'

const RANDOM_SEED = -1

export class HistoryViewService {
  /**
   * The backend stores `created_at` in UTC without a zone suffix; read it as
   * UTC so times and day groups follow the user's clock.
   */
  toLocalTime(createdAt: string): Dayjs {
    return dayjs(`${createdAt}Z`)
  }

  /** Runs whose prompt contains the query, ignoring case. */
  filterByPrompt(histories: HistoryItem[], query: string) {
    const needle = toLower(query.trim())
    return filter(histories, (history) =>
      includes(toLower(history.prompt), needle)
    )
  }

  /** Runs grouped by local day, newest day and newest run first. */
  groupByDay(histories: HistoryItem[], now: Dayjs = dayjs()): HistoryDay[] {
    const newestFirst = orderBy(histories, ['created_at'], ['desc'])
    const byDay = groupBy(newestFirst, (history) =>
      this.toLocalTime(history.created_at).format('YYYY-MM-DD')
    )

    return map(Object.entries(byDay), ([day, runs]) => ({
      label: this.toDayLabel(dayjs(day), now),
      runs
    }))
  }

  toDayLabel(day: Dayjs, now: Dayjs) {
    if (day.isSame(now, 'day')) return 'Today'
    if (day.isSame(now.subtract(1, 'day'), 'day')) return 'Yesterday'
    return day.format('MMM D, YYYY')
  }

  toSizeLabel(width: number, height: number) {
    if (width === height) return `${width}²`
    return `${width} × ${height}`
  }

  /** Time, image count and size under a run card. */
  toRunMeta(history: HistoryItem) {
    const { config } = history
    return [
      this.toLocalTime(history.created_at).format('HH:mm'),
      history.generated_images.length,
      this.toSizeLabel(config.width, config.height)
    ].join(' · ')
  }

  /** The run's config as label and value rows for the detail panel. */
  toConfigRows(history: HistoryItem, samplerName: string): HistoryConfigRow[] {
    const { config } = history
    const rows: HistoryConfigRow[] = [
      { label: 'Prompt', value: history.prompt, isMono: false },
      { label: 'Model', value: history.model, isMono: false },
      {
        label: 'Size',
        value: `${config.width} × ${config.height}`,
        isMono: true
      },
      {
        label: 'Sampler',
        value: `${samplerName} · ${config.steps} steps`,
        isMono: false
      },
      { label: 'CFG scale', value: `${config.cfg_scale}`, isMono: true },
      {
        label: 'Seed',
        value: config.seed === RANDOM_SEED ? 'Random' : `${config.seed}`,
        isMono: true
      }
    ]

    if (config.hires_fix) {
      rows.push({
        label: 'Hires fix',
        value: `${config.hires_fix.upscaler} ×${config.hires_fix.upscale_factor} · ${config.hires_fix.denoising_strength}`,
        isMono: false
      })
    }

    return rows
  }
}

export const historyViewService = new HistoryViewService()
