import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { describe, expect, it } from 'vitest'

import {
  createCapturedGeneratorConfigFormWrapper,
  createGeneratorConfigFormWrapper
} from '@/cores/test-utils'
import { useGeneratorAspectRatio } from '../useGeneratorAspectRatio'

const Wrapper = createGeneratorConfigFormWrapper()

describe('useGeneratorAspectRatio', () => {
  it('returns width / height from generator form values', () => {
    const { result } = renderHook(() => useGeneratorAspectRatio(), {
      wrapper: Wrapper
    })

    expect(result.current).toBe(1)
  })

  it('updates when width/height change', () => {
    const { Wrapper: CaptureWrapper, getMethods } =
      createCapturedGeneratorConfigFormWrapper()

    const { result } = renderHook(() => useGeneratorAspectRatio(), {
      wrapper: CaptureWrapper
    })

    act(() => {
      const methods = getMethods()
      methods.setValue('width', 1024)
      methods.setValue('height', 512)
    })

    expect(result.current).toBe(2)
  })
})
