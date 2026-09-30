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
      sampler: 'EulerAncestralDiscreteScheduler'
    },
    generated_images: [{ id: id * 10, path: `static/${id}.png` }]
  }) as HistoryItem

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

  it('lists the config with the sampler name and a random seed', () => {
    const rows = historyViewService.toConfigRows(
      run(1, '2026-10-01T09:00:00', 'a lighthouse'),
      'Euler A'
    )

    expect(rows).toContainEqual({
      label: 'Sampler',
      value: 'Euler A · 24 steps',
      isMono: false
    })
    expect(rows).toContainEqual({
      label: 'Seed',
      value: 'Random',
      isMono: true
    })
  })
})
