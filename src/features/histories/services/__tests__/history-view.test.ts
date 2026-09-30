import { HistoryConfigRowKind } from '@/features/histories/types'
import { HistoryItem } from '@/types'
import dayjs from 'dayjs'
import { map } from 'es-toolkit/compat'
import { describe, expect, it } from 'vitest'
import { historyViewService } from '../history-view'

const run = (id: number, createdAt: string, prompt: string) =>
  ({
    id,
    prompt,
    model: 'segmind/small-sd',
    created_at: createdAt,
    config: {
      width: 512,
      height: 512,
      steps: 24,
      cfg_scale: 7.5,
      seed: -1,
      sampler: 'EulerAncestralDiscreteScheduler',
      negative_prompt: '',
      number_of_images: 1,
      clip_skip: 1,
      styles: ['cinematic'],
      loras: []
    },
    generated_images: [{ id: id * 10, path: `static/${id}.png` }]
  }) as unknown as HistoryItem

describe('historyViewService', () => {
  it('reads created_at as UTC', () => {
    expect(
      historyViewService.toLocalTime('2026-09-30T13:37:00').toISOString()
    ).toBe('2026-09-30T13:37:00.000Z')
  })

  it('groups runs by local day, newest first, with Today and Yesterday', () => {
    const now = dayjs('2026-10-01T12:00:00Z')
    const days = historyViewService.groupByDay(
      [
        run(1, '2026-09-28T10:00:00', 'older'),
        run(2, '2026-10-01T09:00:00', 'today early'),
        run(3, '2026-10-01T11:00:00', 'today late'),
        run(4, '2026-09-30T10:00:00', 'yesterday')
      ],
      now
    )

    expect(map(days, 'label').slice(0, 2)).toEqual(['Today', 'Yesterday'])
    expect(map(days[0].runs, 'id')).toEqual([3, 2])
    expect(days).toHaveLength(3)
  })

  it('filters by prompt, ignoring case', () => {
    const runs = [run(1, '2026-10-01T09:00:00', 'A Lighthouse at dusk')]

    expect(historyViewService.filterByPrompt(runs, 'lighthouse')).toHaveLength(
      1
    )
    expect(historyViewService.filterByPrompt(runs, 'forest')).toHaveLength(0)
  })

  it('lists every stored setting, with names for styles and LoRAs', () => {
    const rows = historyViewService.toConfigRows(
      run(1, '2026-10-01T09:00:00', 'a lighthouse'),
      {
        samplerName: 'Euler A',
        styleNames: ['Cinematic'],
        loraLabels: []
      }
    )
    const byLabel = Object.fromEntries(map(rows, (row) => [row.label, row]))

    expect(map(rows, 'label')).toEqual([
      'Prompt',
      'Negative prompt',
      'Model',
      'Size',
      'Images',
      'Sampler',
      'CFG scale',
      'CLIP skip',
      'Seed',
      'Hires fix',
      'Styles',
      'LoRAs'
    ])
    expect(byLabel['Sampler'].values).toEqual(['Euler A · 24 steps'])
    expect(byLabel['Negative prompt'].values).toEqual(['None'])
    expect(byLabel['Seed'].values).toEqual(['Random'])
    expect(byLabel['Hires fix'].values).toEqual(['Off'])
    expect(byLabel['Styles']).toEqual({
      label: 'Styles',
      kind: HistoryConfigRowKind.CHIPS,
      values: ['Cinematic']
    })
  })
})
