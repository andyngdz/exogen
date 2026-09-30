import { StageView, StageViewInput } from '@/features/generator-stage/types'
import { describe, expect, it } from 'vitest'
import { stageViewService } from '../stage-view'

const ready: StageViewInput = {
  isBackendOffline: false,
  isModelLoading: false,
  hasFailure: false,
  hasModel: true,
  hasOutput: true
}

describe('stageViewService', () => {
  it.each<[string, Partial<StageViewInput>, StageView]>([
    [
      'offline before everything else',
      {
        isBackendOffline: true,
        isModelLoading: true,
        hasFailure: true,
        hasModel: false
      },
      StageView.OFFLINE
    ],
    [
      'model loading before a failure',
      { isModelLoading: true, hasFailure: true, hasOutput: false },
      StageView.MODEL_LOADING
    ],
    [
      'model loading over the last results when there are any',
      { isModelLoading: true, hasFailure: true },
      StageView.MODEL_LOADING_OVER_RESULTS
    ],
    [
      'a failure before a missing model',
      { hasFailure: true, hasModel: false },
      StageView.FAILED
    ],
    [
      'no model before the first run',
      { hasModel: false, hasOutput: false },
      StageView.NO_MODEL
    ],
    ['the first run with no output', { hasOutput: false }, StageView.FIRST_RUN],
    ['results otherwise', {}, StageView.RESULTS]
  ])('shows %s', (_label, overrides, view) => {
    expect(stageViewService.toView({ ...ready, ...overrides })).toBe(view)
  })
})
