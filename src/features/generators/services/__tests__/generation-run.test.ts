import { generationRunService } from '@/features/generators/services/generation-run'
import { GenerateBlockReason } from '@/features/generators/types'
import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'

const axiosErrorWith = (status: number, data: unknown) =>
  new AxiosError('Request failed', 'ERR_BAD_RESPONSE', undefined, undefined, {
    status,
    statusText: '',
    data,
    headers: {},
    config: { headers: new AxiosHeaders() }
  })

const blocked = {
  isBackendOffline: false,
  isModelLoading: false,
  hasModel: true,
  needsInputImage: false
}

describe('generationRunService', () => {
  it('uses a string detail from the backend', () => {
    const error = axiosErrorWith(500, {
      detail: 'CUDA out of memory. Tried to allocate 2.00 GiB'
    })

    expect(generationRunService.toFailureMessage(error)).toBe(
      'CUDA out of memory. Tried to allocate 2.00 GiB'
    )
  })

  it('joins the messages of a FastAPI validation error', () => {
    const error = axiosErrorWith(422, {
      detail: [
        { loc: ['body', 'width'], msg: 'Input should be a multiple of 8' },
        { loc: ['body', 'steps'], msg: 'Input should be at most 150' }
      ]
    })

    expect(generationRunService.toFailureMessage(error)).toBe(
      'Input should be a multiple of 8; Input should be at most 150'
    )
  })

  it('falls back to the error message, then to a generic line', () => {
    expect(
      generationRunService.toFailureMessage(new Error('Network Error'))
    ).toBe('Network Error')
    expect(generationRunService.toFailureMessage('boom')).toBe(
      'The backend did not say why.'
    )
  })

  it('reports the highest step reached, or none', () => {
    const stepEnd = (index: number, current_step: number) => ({
      index,
      current_step,
      timestep: 0,
      image_base64: ''
    })

    expect(
      generationRunService.toLastStep([stepEnd(0, 12), stepEnd(1, 9)])
    ).toBe(12)
    expect(generationRunService.toLastStep([stepEnd(0, 0)])).toBeUndefined()
    expect(generationRunService.toLastStep([])).toBeUndefined()
  })

  it('returns the first block reason in order', () => {
    expect(generationRunService.getBlockReason(blocked)).toBeUndefined()
    expect(
      generationRunService.getBlockReason({
        isBackendOffline: true,
        isModelLoading: true,
        hasModel: false,
        needsInputImage: true
      })
    ).toBe(GenerateBlockReason.BACKEND_OFFLINE)
    expect(
      generationRunService.getBlockReason({ ...blocked, isModelLoading: true })
    ).toBe(GenerateBlockReason.MODEL_LOADING)
    expect(
      generationRunService.getBlockReason({ ...blocked, hasModel: false })
    ).toBe(GenerateBlockReason.NO_MODEL)
    expect(
      generationRunService.getBlockReason({ ...blocked, needsInputImage: true })
    ).toBe(GenerateBlockReason.NO_INPUT_IMAGE)
  })
})
