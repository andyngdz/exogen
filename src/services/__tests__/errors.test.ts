import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'
import { apiErrorService } from '../errors'

const axiosErrorWithDetail = (detail: unknown) =>
  new AxiosError(
    'Request failed with status code 500',
    'ERR_BAD_RESPONSE',
    undefined,
    undefined,
    {
      status: 500,
      statusText: 'Internal Server Error',
      data: { detail },
      headers: {},
      config: { headers: new AxiosHeaders() }
    }
  )

describe('apiErrorService.toMessage', () => {
  it('prefers the backend detail string over the axios message', () => {
    expect(
      apiErrorService.toMessage(axiosErrorWithDetail('CUDA out of memory'), 'x')
    ).toBe('CUDA out of memory')
  })

  it('joins a FastAPI validation list', () => {
    const detail = [{ msg: 'steps too high' }, { msg: 'width not a number' }]

    expect(apiErrorService.toMessage(axiosErrorWithDetail(detail), 'x')).toBe(
      'steps too high; width not a number'
    )
  })

  it('falls back to the error message, then to the given text', () => {
    expect(apiErrorService.toMessage(new Error('Network Error'), 'x')).toBe(
      'Network Error'
    )
    expect(apiErrorService.toMessage('offline', 'Try again.')).toBe(
      'Try again.'
    )
  })
})
