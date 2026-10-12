import {
  HistoryConfigNames,
  HistoryConfigRow,
  HistoryConfigRowKind,
  HistoryDay
} from '@/features/histories/types'
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

  /** Every stored setting of the run as a row for the detail panel. */
  toConfigRows(
    history: HistoryItem,
    names: HistoryConfigNames
  ): HistoryConfigRow[] {
    const { config } = history
    const text = (label: string, value: string) => ({
      label,
      kind: HistoryConfigRowKind.TEXT,
      values: [value]
    })
    const mono = (label: string, value: string) => ({
      label,
      kind: HistoryConfigRowKind.MONO,
      values: [value]
    })
    const chips = (label: string, values: string[]) => ({
      label,
      kind: HistoryConfigRowKind.CHIPS,
      values
    })

    return [
      text('Prompt', history.prompt),
      text('Negative prompt', config.negative_prompt || 'None'),
      text('Model', history.model),
      mono('Size', `${config.width} × ${config.height}`),
      mono('Images', `${config.number_of_images}`),
      text('Sampler', `${names.samplerName} · ${config.steps} steps`),
      mono('CFG scale', `${config.cfg_scale}`),
      mono('CLIP skip', `${config.clip_skip}`),
      mono('Seed', config.seed === RANDOM_SEED ? 'Random' : `${config.seed}`),
      text('Hires fix', this.toHiresLabel(config.hires_fix)),
      chips('Styles', names.styleNames),
      chips('LoRAs', names.loraLabels)
    ]
  }

  private toHiresLabel(hiresFix: HistoryItem['config']['hires_fix']) {
    if (!hiresFix) return 'Off'
    return `${hiresFix.upscaler} ×${hiresFix.upscale_factor} · ${hiresFix.denoising_strength}`
  }
}

export const historyViewService = new HistoryViewService()
