import {
  SocketConnectionStatus,
  useSocketConnectionStore
} from '@/cores/sockets'
import { createGeneratorConfigFormWrapper } from '@/cores/test-utils'
import { GenerateBlockReason } from '@/features/generators/types'
import { useModelLoadProgressStore } from '@/features/model-load-progress/states/useModelLoadProgressStore'
import { useModelSelectorStore } from '@/features/model-selectors/states'
import { GeneratorMode } from '@/types'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGenerationStatusStore } from '../useGenerationStatusStore'
import { useGeneratorModeStore } from '../useGeneratorModeStore'
import { useGeneratorSubmit } from '../useGeneratorSubmit'
import { useImage2ImageConfigStore } from '../useImage2ImageConfigStore'
import { useLastRunStore } from '../useLastRunStore'

const { mockTextGenerate, mockImageGenerate } = vi.hoisted(() => ({
  mockTextGenerate: vi.fn(),
  mockImageGenerate: vi.fn()
}))

vi.mock('../useGenerator', () => ({
  useGenerator: () => ({ onGenerate: mockTextGenerate })
}))

vi.mock('../useImage2ImageGenerator', () => ({
  useImage2ImageGenerator: () => ({ onGenerate: mockImageGenerate })
}))

const renderSubmit = () =>
  renderHook(() => useGeneratorSubmit(), {
    wrapper: createGeneratorConfigFormWrapper({
      overrides: { prompt: 'a lighthouse', seed: -1, steps: 24 }
    })
  })

describe('useGeneratorSubmit', () => {
  beforeEach(() => {
    mockTextGenerate.mockReset()
    mockImageGenerate.mockReset()
    useSocketConnectionStore.setState({
      status: SocketConnectionStatus.CONNECTED
    })
    useModelLoadProgressStore.setState({ model_id: undefined })
    useModelSelectorStore.setState({ selected_model_id: 'segmind/small-sd' })
    useGeneratorModeStore.setState({ mode: GeneratorMode.TEXT_2_IMAGE })
    useImage2ImageConfigStore.setState({ initImageBase64: undefined })
    useGenerationStatusStore.setState({ isGenerating: false })
    useLastRunStore.setState({
      prompt: undefined,
      seed: undefined,
      steps: undefined
    })
  })

  it('runs text to image and remembers the submitted prompt and seed', async () => {
    const { result } = renderSubmit()

    act(() => {
      result.current.onSubmit()
    })

    await waitFor(() => {
      expect(mockTextGenerate).toHaveBeenCalledTimes(1)
    })
    expect(mockImageGenerate).not.toHaveBeenCalled()
    expect(useLastRunStore.getState()).toEqual({
      prompt: 'a lighthouse',
      seed: -1,
      steps: 24
    })
  })

  it('runs image to image when an input image is set', async () => {
    useGeneratorModeStore.setState({ mode: GeneratorMode.IMAGE_2_IMAGE })
    useImage2ImageConfigStore.setState({ initImageBase64: 'data:image/png' })
    const { result } = renderSubmit()

    act(() => {
      result.current.onSubmit()
    })

    await waitFor(() => {
      expect(mockImageGenerate).toHaveBeenCalledTimes(1)
    })
    expect(mockTextGenerate).not.toHaveBeenCalled()
  })

  it.each([
    [
      'the backend is offline',
      () =>
        useSocketConnectionStore.setState({
          status: SocketConnectionStatus.DISCONNECTED
        }),
      GenerateBlockReason.BACKEND_OFFLINE
    ],
    [
      'a model is loading',
      () => useModelLoadProgressStore.setState({ model_id: 'sdxl' }),
      GenerateBlockReason.MODEL_LOADING
    ],
    [
      'no model is selected',
      () => useModelSelectorStore.setState({ selected_model_id: '' }),
      GenerateBlockReason.NO_MODEL
    ],
    [
      'image mode has no input image',
      () =>
        useGeneratorModeStore.setState({ mode: GeneratorMode.IMAGE_2_IMAGE }),
      GenerateBlockReason.NO_INPUT_IMAGE
    ]
  ])('blocks the run when %s', async (_label, arrange, reason) => {
    arrange()
    const { result } = renderSubmit()

    expect(result.current.isDisabled).toBe(true)
    expect(result.current.disabledReason).toBe(reason)

    act(() => {
      result.current.onSubmit()
    })
    await Promise.resolve()

    expect(mockTextGenerate).not.toHaveBeenCalled()
    expect(mockImageGenerate).not.toHaveBeenCalled()
  })

  it('does not start a second run while one is generating', async () => {
    useGenerationStatusStore.setState({ isGenerating: true })
    const { result } = renderSubmit()

    expect(result.current.isDisabled).toBe(true)
    expect(result.current.disabledReason).toBeUndefined()

    act(() => {
      result.current.onSubmit()
    })
    await Promise.resolve()

    expect(mockTextGenerate).not.toHaveBeenCalled()
  })
})
