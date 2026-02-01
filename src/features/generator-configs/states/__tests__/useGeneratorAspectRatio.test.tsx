import { renderHook } from '@testing-library/react'
import { act } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { createGeneratorConfigFormWrapper } from '@/cores/test-utils'
import type { GeneratorConfigFormValues } from '../../types/generator-config'
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
    let methods: UseFormReturn<GeneratorConfigFormValues> | undefined

    const CaptureWrapper = createGeneratorConfigFormWrapper({
      onMethods: (m) => {
        methods = m
      }
    })

    const { result } = renderHook(() => useGeneratorAspectRatio(), {
      wrapper: CaptureWrapper
    })

    act(() => {
      methods?.setValue('width', 1024)
      methods?.setValue('height', 512)
    })

    expect(result.current).toBe(2)
  })
})
