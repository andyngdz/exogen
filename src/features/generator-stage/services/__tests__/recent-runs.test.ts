import { HistoryItem } from '@/types'
import dayjs from 'dayjs'
import { map } from 'es-toolkit/compat'
import { describe, expect, it } from 'vitest'
import { recentRunService } from '../recent-runs'

const history = (id: number, seed: number, images: number) =>
  ({
    id,
    prompt: `run ${id}`,
    created_at: `2026-09-30T13:4${id}:00`,
    config: { seed },
    generated_images: Array.from({ length: images }, (_, index) => ({
      path: `static/generated_images/${id}-${index}.png`
    }))
  }) as HistoryItem

describe('recentRunService', () => {
  it('keeps the newest runs up to the limit with a summary line', () => {
    const runs = recentRunService.toRecentRuns(
      [history(1, 7, 2), history(2, 42, 1), history(3, -1, 4)],
      'http://localhost:8000',
      2
    )

    expect(map(runs, 'prompt')).toEqual(['run 3', 'run 2'])
    // created_at is UTC without a suffix; the label shows it on the local clock.
    const localTime = (createdAt: string) =>
      dayjs(`${createdAt}Z`).format('HH:mm')
    expect(runs[0].metaLabel).toBe(
      `${localTime('2026-09-30T13:43:00')} · 4 images · random seed`
    )
    expect(runs[1].metaLabel).toBe(
      `${localTime('2026-09-30T13:42:00')} · 1 image · seed 42`
    )
    expect(runs[0].thumbnailUrl).toBe(
      'http://localhost:8000/static/generated_images/3-0.png'
    )
  })

  it('leaves out the thumbnail for a run without images', () => {
    const [run] = recentRunService.toRecentRuns(
      [history(5, 1, 0)],
      'http://localhost:8000',
      5
    )

    expect(run.thumbnailUrl).toBeUndefined()
  })
})
