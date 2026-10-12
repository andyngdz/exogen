import {
  GENERATION_ERROR_ACTIONS,
  useGenerationErrorStore,
  useGeneratorModeStore,
  useImage2ImageConfigStore
} from '@/features/generators'
import { GeneratorMode } from '@/types'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useGeneratorModeTabs } from '../useGeneratorModeTabs'

describe('useGeneratorModeTabs', () => {
  beforeEach(() => {
    useGeneratorModeStore.setState({ mode: GeneratorMode.TEXT_2_IMAGE })
    useImage2ImageConfigStore.setState({ initImageBase64: undefined })
    GENERATION_ERROR_ACTIONS.clear()
  })

  it('clears a generation failure when the mode changes', () => {
    GENERATION_ERROR_ACTIONS.recordFailure(new Error('CUDA out of memory'))
    const { result } = renderHook(() => useGeneratorModeTabs())

    act(() => {
      result.current.onModeChange(GeneratorMode.IMAGE_2_IMAGE)
    })

    expect(useGeneratorModeStore.getState().mode).toBe(
      GeneratorMode.IMAGE_2_IMAGE
    )
    expect(useGenerationErrorStore.getState().failure).toBeUndefined()
  })

  it('drops the input image when switching back to text to image', () => {
    useGeneratorModeStore.setState({ mode: GeneratorMode.IMAGE_2_IMAGE })
    useImage2ImageConfigStore.setState({ initImageBase64: 'data:image/png' })
    const { result } = renderHook(() => useGeneratorModeTabs())

    act(() => {
      result.current.onModeChange(GeneratorMode.TEXT_2_IMAGE)
    })

    expect(useImage2ImageConfigStore.getState().initImageBase64).toBeFalsy()
  })
})
