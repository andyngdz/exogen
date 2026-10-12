import { UpscaleFactor, UpscalerType } from '@/cores/constants'
import {
  createQueryClientWrapper,
  createStoreSelectorMock
} from '@/cores/test-utils'
import { api } from '@/services'
import { toast } from '@heroui/react'
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useGenerator } from '../useGenerator'
import { useGenerationErrorStore } from '../useGenerationErrorStore'
import { useGenerationStatusStore } from '../useGenerationStatusStore'
import { useHiresFixEnabledStore } from '../useHiresFixEnabledStore'
import { useUseImageGenerationStore } from '../useImageGenerationResponseStores'

// Mock the API module with a factory so addHistory is a mock function
vi.mock('@/services/api', () => ({
  api: {
    addHistory: vi.fn(),
    generator: vi.fn().mockResolvedValue({
      items: [],
      nsfw_content_detected: []
    })
  }
}))

// Mock HeroUI toast functions
vi.mock('@heroui/react', () => ({
  toast: { success: vi.fn(), danger: vi.fn(), warning: vi.fn() }
}))

// Mock the store hooks
vi.mock('../useGenerationStatusStore', () => ({
  useGenerationStatusStore: vi.fn((selector: (state: object) => unknown) =>
    selector({
      onSetIsGenerating: vi.fn()
    })
  )
}))

vi.mock('../useImageGenerationResponseStores', () => ({
  useUseImageGenerationStore: Object.assign(
    vi.fn((selector: (state: object) => unknown) =>
      selector({
        onCompleted: vi.fn(),
        onInit: vi.fn()
      })
    ),
    { getState: () => ({ imageStepEnds: [] }) }
  )
}))

vi.mock('../useHiresFixEnabledStore', () => ({
  useHiresFixEnabledStore: vi.fn()
}))

afterEach(() => {
  vi.resetAllMocks()
})

beforeEach(() => {
  useGenerationErrorStore.setState({ failure: undefined })
  vi.mocked(useHiresFixEnabledStore).mockImplementation(
    createStoreSelectorMock({
      isHiresFixEnabled: false,
      setIsHiresFixEnabled: vi.fn()
    })
  )
})

describe('useGenerator', () => {
  const mockConfig = {
    model: 'test-model',
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
    styles: []
  }

  it('should call mutate with the config and update generation status', async () => {
    const mockSetIsGenerating = vi.fn()
    vi.mocked(useGenerationStatusStore).mockImplementation(
      createStoreSelectorMock({
        onSetIsGenerating: mockSetIsGenerating
      })
    )

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useGenerator(), { wrapper })

    await act(async () => {
      await result.current.onGenerate(mockConfig)
    })

    expect(api.addHistory).toHaveBeenCalledWith(mockConfig)
    expect(mockSetIsGenerating).toHaveBeenCalledWith(true)
    expect(mockSetIsGenerating).toHaveBeenCalledWith(false)
  })

  it('should handle success case and update all stores', async () => {
    vi.mocked(api.addHistory).mockResolvedValue(1) // API returns a number ID

    // Mock the generator API with a proper response
    const mockGeneratorResponse = {
      items: [{ path: 'test/path.jpg', file_name: 'test.jpg' }],
      nsfw_content_detected: [false]
    }
    vi.mocked(api.generator).mockResolvedValue(mockGeneratorResponse)

    // Mock store functions
    const mockSetIsGenerating = vi.fn()
    const mockInit = vi.fn()
    const mockCompleted = vi.fn()

    vi.mocked(useGenerationStatusStore).mockImplementation(
      createStoreSelectorMock({
        onSetIsGenerating: mockSetIsGenerating
      })
    )
    vi.mocked(useUseImageGenerationStore).mockImplementation(
      createStoreSelectorMock({
        onInit: mockInit,
        onCompleted: mockCompleted
      })
    )

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useGenerator(), { wrapper })

    await act(async () => {
      await result.current.onGenerate(mockConfig)
    })

    expect(api.addHistory).toHaveBeenCalledWith(mockConfig)
    expect(api.generator).toHaveBeenCalledWith({
      history_id: 1,
      config: mockConfig
    })

    // Verify store interactions
    expect(mockSetIsGenerating).toHaveBeenCalledWith(true)
    expect(mockInit).toHaveBeenCalledWith(mockConfig.number_of_images)
    expect(mockCompleted).toHaveBeenCalled()
    const completedCall = mockCompleted.mock.calls.at(-1) ?? []
    expect(completedCall[0]).toEqual(mockGeneratorResponse)
    expect(mockSetIsGenerating).toHaveBeenCalledWith(false)
  })

  it('records an addHistory failure and resets the generation status', async () => {
    const mockError = new Error('Test error')
    vi.mocked(api.addHistory).mockRejectedValue(mockError)

    // Mock store functions
    const mockSetIsGenerating = vi.fn()

    vi.mocked(useGenerationStatusStore).mockImplementation(
      createStoreSelectorMock({
        onSetIsGenerating: mockSetIsGenerating
      })
    )

    vi.mocked(useUseImageGenerationStore).mockImplementation(
      createStoreSelectorMock({
        onInit: vi.fn(),
        onCompleted: vi.fn()
      })
    )

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useGenerator(), { wrapper })

    await act(async () => {
      await result.current.onGenerate(mockConfig)
    })

    expect(useGenerationErrorStore.getState().failure).toEqual({
      message: 'Test error',
      step: undefined
    })
    expect(api.addHistory).toHaveBeenCalledWith(mockConfig)
    // Generator function should not be called since addHistory fails
    expect(api.generator).not.toHaveBeenCalled()

    // Verify store interactions
    expect(mockSetIsGenerating).toHaveBeenCalledWith(true)
    expect(mockSetIsGenerating).toHaveBeenCalledWith(false)
  })

  it('records a generator failure for the stage instead of a toast', async () => {
    const error = new Error('Generator error')
    vi.mocked(api.addHistory).mockResolvedValue(1)
    vi.mocked(api.generator).mockRejectedValue(error)

    // Mock store functions
    const mockSetIsGenerating = vi.fn()
    const mockInit = vi.fn()

    vi.mocked(useGenerationStatusStore).mockImplementation(
      createStoreSelectorMock({
        onSetIsGenerating: mockSetIsGenerating
      })
    )
    vi.mocked(useUseImageGenerationStore).mockImplementation(
      createStoreSelectorMock({
        onInit: mockInit,
        onCompleted: vi.fn()
      })
    )

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useGenerator(), { wrapper })

    await act(async () => {
      await result.current.onGenerate(mockConfig)
    })

    expect(api.addHistory).toHaveBeenCalledWith(mockConfig)
    expect(api.generator).toHaveBeenCalled()
    expect(useGenerationErrorStore.getState().failure).toEqual({
      message: 'Generator error',
      step: undefined
    })
    expect(vi.mocked(toast.danger)).not.toHaveBeenCalled()

    // Verify store interactions
    expect(mockSetIsGenerating).toHaveBeenCalledWith(true)
    expect(mockInit).toHaveBeenCalledWith(mockConfig.number_of_images)
    expect(mockSetIsGenerating).toHaveBeenCalledWith(false)
  })

  it('should handle success case for addHistory and show toast', async () => {
    vi.mocked(api.addHistory).mockResolvedValue(1)

    // Mock store functions
    const mockSetIsGenerating = vi.fn()

    vi.mocked(useGenerationStatusStore).mockImplementation(
      createStoreSelectorMock({
        onSetIsGenerating: mockSetIsGenerating
      })
    )

    vi.mocked(useUseImageGenerationStore).mockImplementation(
      createStoreSelectorMock({
        onInit: vi.fn(),
        onCompleted: vi.fn()
      })
    )

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useGenerator(), { wrapper })

    await act(async () => {
      await result.current.onGenerate(mockConfig)
    })

    expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
      'Added history',
      expect.anything()
    )
  })

  describe('hires fix payload handling', () => {
    it('should include hires_fix in payload when store isHiresFixEnabled is true', async () => {
      vi.mocked(api.addHistory).mockResolvedValue(1)
      vi.mocked(api.generator).mockResolvedValue({
        items: [],
        nsfw_content_detected: []
      })
      vi.mocked(useHiresFixEnabledStore).mockImplementation(
        createStoreSelectorMock({
          isHiresFixEnabled: true,
          setIsHiresFixEnabled: vi.fn()
        })
      )

      const mockSetIsGenerating = vi.fn()
      vi.mocked(useGenerationStatusStore).mockImplementation(
        createStoreSelectorMock({
          onSetIsGenerating: mockSetIsGenerating
        })
      )
      vi.mocked(useUseImageGenerationStore).mockImplementation(
        createStoreSelectorMock({
          onInit: vi.fn(),
          onCompleted: vi.fn()
        })
      )

      const configWithHiresFix = {
        ...mockConfig,
        hires_fix: {
          upscale_factor: UpscaleFactor.TWO,
          upscaler: UpscalerType.REAL_ESRGAN_X2_PLUS,
          denoising_strength: 0.35,
          steps: 0
        }
      }

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useGenerator(), { wrapper })

      await act(async () => {
        await result.current.onGenerate(configWithHiresFix)
      })

      expect(api.addHistory).toHaveBeenCalledWith(configWithHiresFix)
      expect(api.generator).toHaveBeenCalledWith({
        history_id: 1,
        config: configWithHiresFix
      })
    })

    it('should omit hires_fix from payload when store isHiresFixEnabled is false', async () => {
      vi.mocked(api.addHistory).mockResolvedValue(1)
      vi.mocked(api.generator).mockResolvedValue({
        items: [],
        nsfw_content_detected: []
      })
      vi.mocked(useHiresFixEnabledStore).mockImplementation(
        createStoreSelectorMock({
          isHiresFixEnabled: false,
          setIsHiresFixEnabled: vi.fn()
        })
      )

      const mockSetIsGenerating = vi.fn()
      vi.mocked(useGenerationStatusStore).mockImplementation(
        createStoreSelectorMock({
          onSetIsGenerating: mockSetIsGenerating
        })
      )
      vi.mocked(useUseImageGenerationStore).mockImplementation(
        createStoreSelectorMock({
          onInit: vi.fn(),
          onCompleted: vi.fn()
        })
      )

      const configWithHiresFix = {
        ...mockConfig,
        hires_fix: {
          upscale_factor: UpscaleFactor.TWO,
          upscaler: UpscalerType.REAL_ESRGAN_X2_PLUS,
          denoising_strength: 0.35,
          steps: 0
        }
      }

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useGenerator(), { wrapper })

      await act(async () => {
        await result.current.onGenerate(configWithHiresFix)
      })

      expect(api.addHistory).toHaveBeenCalledWith(mockConfig)
      expect(api.generator).toHaveBeenCalledWith({
        history_id: 1,
        config: mockConfig
      })
    })
  })
})
