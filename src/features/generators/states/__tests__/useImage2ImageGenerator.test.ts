import { createQueryClientWrapper } from '@/cores/test-utils'
import { UpscaleFactor, UpscalerType } from '@/cores/constants'
import { api } from '@/services'
import { Image2ImageResizeMode } from '@/types'
import { addToast } from '@heroui/react'
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useImage2ImageConfigStore } from '../useImage2ImageConfigStore'
import { useImage2ImageGenerator } from '../useImage2ImageGenerator'
import { useGenerationStatusStore } from '../useGenerationStatusStore'
import { useUseImageGenerationStore } from '../useImageGenerationResponseStores'

vi.mock('@/services/api', () => ({
  api: {
    addHistory: vi.fn(),
    img2img: vi.fn().mockResolvedValue({
      items: [],
      nsfw_content_detected: []
    })
  }
}))

vi.mock('@heroui/react', () => ({
  addToast: vi.fn()
}))

vi.mock('../useGenerationStatusStore', () => ({
  useGenerationStatusStore: vi.fn().mockReturnValue({
    onSetIsGenerating: vi.fn()
  })
}))

vi.mock('../useImageGenerationResponseStores', () => ({
  useUseImageGenerationStore: vi.fn().mockReturnValue({
    onCompleted: vi.fn(),
    onInit: vi.fn()
  })
}))

afterEach(() => {
  vi.clearAllMocks()
  useImage2ImageConfigStore.getState().reset()
})

beforeEach(() => {
  useImage2ImageConfigStore.getState().reset()

  vi.mocked(useGenerationStatusStore).mockReturnValue({
    onSetIsGenerating: vi.fn()
  })
  vi.mocked(useUseImageGenerationStore).mockReturnValue({
    onCompleted: vi.fn(),
    onInit: vi.fn()
  })
})

describe('useImage2ImageGenerator', () => {
  const baseConfig = {
    prompt: 'test-prompt',
    negative_prompt: '',
    width: 512,
    height: 512,
    cfg_scale: 7,
    clip_skip: 2,
    steps: 20,
    seed: -1,
    sampler: 'EULER_A',
    loras: [],
    number_of_images: 1,
    styles: [],
    hires_fix: {
      upscale_factor: UpscaleFactor.TWO,
      upscaler: UpscalerType.REAL_ESRGAN_X2_PLUS,
      denoising_strength: 0.35,
      steps: 0
    }
  }

  it('warns and does not call img2img when init image is missing', async () => {
    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useImage2ImageGenerator(), { wrapper })

    await act(async () => {
      await result.current.onGenerate(baseConfig)
    })

    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Missing input image',
        color: 'warning'
      })
    )
    expect(api.img2img).not.toHaveBeenCalled()
  })

  it('calls POST /img2img with composed config and omits hires_fix', async () => {
    vi.mocked(api.addHistory).mockResolvedValue(1)

    useImage2ImageConfigStore
      .getState()
      .setInitImageBase64('data:image/png;base64,abc')
    useImage2ImageConfigStore.getState().setStrength(0.5)
    useImage2ImageConfigStore
      .getState()
      .setResizeMode(Image2ImageResizeMode.CROP)

    const mockSetIsGenerating = vi.fn()
    vi.mocked(useGenerationStatusStore).mockReturnValue({
      onSetIsGenerating: mockSetIsGenerating
    })

    const mockInit = vi.fn()
    const mockCompleted = vi.fn()
    vi.mocked(useUseImageGenerationStore).mockReturnValue({
      onInit: mockInit,
      onCompleted: mockCompleted
    })

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useImage2ImageGenerator(), { wrapper })

    await act(async () => {
      await result.current.onGenerate(baseConfig)
    })

    const addHistoryArg = vi.mocked(api.addHistory).mock.calls[0]?.[0]
    expect(addHistoryArg).toBeDefined()
    expect(addHistoryArg).not.toHaveProperty('hires_fix')

    expect(api.img2img).toHaveBeenCalledWith({
      history_id: 1,
      config: expect.objectContaining({
        init_image: 'data:image/png;base64,abc',
        strength: 0.5,
        resize_mode: Image2ImageResizeMode.CROP,
        prompt: 'test-prompt'
      })
    })

    const img2imgArg = vi.mocked(api.img2img).mock.calls[0]?.[0]
    expect(img2imgArg).toBeDefined()
    expect(img2imgArg.config).not.toHaveProperty('hires_fix')
    expect(mockSetIsGenerating).toHaveBeenCalledWith(true)
    expect(mockSetIsGenerating).toHaveBeenCalledWith(false)
  })
})
