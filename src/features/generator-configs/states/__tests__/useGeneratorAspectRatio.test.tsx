import { renderHook } from '@testing-library/react'
import { act, useEffect, type ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { generatorConfigFormDefaults } from '@/cores/test-utils'
import { GeneratorConfigFormValues } from '../../types/generator-config'
import { useGeneratorAspectRatio } from '../useGeneratorAspectRatio'

const Wrapper = ({ children }: { children: ReactNode }) => {
  const methods = useForm<GeneratorConfigFormValues>({
    defaultValues: generatorConfigFormDefaults()
  })

  return <FormProvider {...methods}>{children}</FormProvider>
}

describe('useGeneratorAspectRatio', () => {
  it('returns width / height from generator form values', () => {
    const { result } = renderHook(() => useGeneratorAspectRatio(), {
      wrapper: Wrapper
    })

    expect(result.current).toBe(1)
  })

  it('updates when width/height change', () => {
    let methods:
      | ReturnType<typeof useForm<GeneratorConfigFormValues>>
      | undefined

    const CaptureWrapper = ({ children }: { children: ReactNode }) => {
      const m = useForm<GeneratorConfigFormValues>({
        defaultValues: generatorConfigFormDefaults()
      })

      useEffect(() => {
        methods = m
      }, [m])

      return <FormProvider {...m}>{children}</FormProvider>
    }

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
