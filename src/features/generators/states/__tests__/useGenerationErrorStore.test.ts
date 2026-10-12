import { beforeEach, describe, expect, it } from 'vitest'
import {
  GENERATION_ERROR_ACTIONS,
  useGenerationErrorStore
} from '../useGenerationErrorStore'
import { useUseImageGenerationStore } from '../useImageGenerationResponseStores'

describe('GENERATION_ERROR_ACTIONS', () => {
  beforeEach(() => {
    useGenerationErrorStore.setState({ failure: undefined })
    // Step ends left over from the previous, finished run.
    useUseImageGenerationStore.setState({
      imageStepEnds: [
        { index: 0, current_step: 24, timestep: 0, image_base64: '' }
      ]
    })
  })

  it('records the last step for a failure during generation', () => {
    GENERATION_ERROR_ACTIONS.recordFailure(new Error('CUDA out of memory'))

    expect(useGenerationErrorStore.getState().failure).toEqual({
      message: 'CUDA out of memory',
      step: 24
    })
  })

  it('leaves the stale step out of a failure before generation starts', () => {
    GENERATION_ERROR_ACTIONS.recordStartFailure(new Error('Database locked'))

    expect(useGenerationErrorStore.getState().failure).toEqual({
      message: 'Database locked'
    })
    expect(useGenerationErrorStore.getState().failure).not.toHaveProperty(
      'step'
    )
  })

  it('clears the failure', () => {
    GENERATION_ERROR_ACTIONS.recordStartFailure(new Error('Database locked'))
    GENERATION_ERROR_ACTIONS.clear()

    expect(useGenerationErrorStore.getState().failure).toBeUndefined()
  })
})
