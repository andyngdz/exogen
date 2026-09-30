import { dataUrlService } from '@/services/data-url'
import { GeneratorMode } from '@/types'
import { toast } from '@heroui/react'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGeneratorModeStore } from '../useGeneratorModeStore'
import { useImage2ImageConfigStore } from '../useImage2ImageConfigStore'
import { useImageAsInput } from '../useImageAsInput'

vi.mock('@/services/data-url', () => ({
  dataUrlService: { fetchUrlToDataUrl: vi.fn() }
}))

vi.mock('@heroui/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@heroui/react')>()),
  toast: { danger: vi.fn() }
}))

const IMAGE_URL = 'http://localhost:8000/images/out.png'

describe('useImageAsInput', () => {
  beforeEach(() => {
    vi.mocked(toast.danger).mockClear()
    useGeneratorModeStore.setState({ mode: GeneratorMode.TEXT_2_IMAGE })
    useImage2ImageConfigStore.setState({ initImageBase64: undefined })
  })

  it('sets the image as input and switches to image mode', async () => {
    vi.mocked(dataUrlService.fetchUrlToDataUrl).mockResolvedValue(
      'data:image/png;base64,out'
    )
    const { result } = renderHook(() => useImageAsInput())

    let isLoaded = false
    await act(async () => {
      isLoaded = await result.current.loadAsInput(IMAGE_URL)
    })

    expect(isLoaded).toBe(true)
    expect(dataUrlService.fetchUrlToDataUrl).toHaveBeenCalledWith(IMAGE_URL)
    expect(useImage2ImageConfigStore.getState().initImageBase64).toBe(
      'data:image/png;base64,out'
    )
    expect(useGeneratorModeStore.getState().mode).toBe(
      GeneratorMode.IMAGE_2_IMAGE
    )
  })

  it.each([
    [new Error('Failed to convert image'), 'Failed to convert image'],
    ['failed', 'Failed to use image as input']
  ])(
    'shows a toast and keeps the mode when loading fails (%s)',
    async (error, description) => {
      vi.mocked(dataUrlService.fetchUrlToDataUrl).mockRejectedValue(error)
      const { result } = renderHook(() => useImageAsInput())

      let isLoaded = true
      await act(async () => {
        isLoaded = await result.current.loadAsInput(IMAGE_URL)
      })

      expect(isLoaded).toBe(false)
      expect(toast.danger).toHaveBeenCalledWith('Use as input', { description })
      expect(useGeneratorModeStore.getState().mode).toBe(
        GeneratorMode.TEXT_2_IMAGE
      )
    }
  )
})
