import { describe, expect, it } from 'vitest'
import { stageFailureService } from '../stage-failure'

describe('stageFailureService', () => {
  it.each([
    [undefined, undefined, 'Generation failed'],
    [12, undefined, 'Generation failed at step 12'],
    [12, 30, 'Generation failed at step 12 of 30']
  ])('titles step %s of %s as "%s"', (step, totalSteps, title) => {
    expect(stageFailureService.toTitle(step, totalSteps)).toBe(title)
  })
})
