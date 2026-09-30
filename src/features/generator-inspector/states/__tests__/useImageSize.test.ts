import { createGeneratorConfigFormWrapper } from '@/cores/test-utils'
import { GeneratorConfigFormValues } from '@/features/generator-configs'
import { ImageSizePreset } from '@/features/generator-inspector/types'
import { useModelSelectorStore } from '@/features/model-selectors/states'
import { ModelFamily } from '@/types'
import { act, renderHook } from '@testing-library/react'
import type { UseFormReturn } from 'react-hook-form'
import { beforeEach, describe, expect, it } from 'vitest'
import { useImageSizeFamilySync } from '../useImageSizeFamilySync'
import { useImageSizePreset } from '../useImageSizePreset'
import { IMAGE_SIZE_ACTIONS, useImageSizeStore } from '../useImageSizeStore'

let form: UseFormReturn<GeneratorConfigFormValues>

const renderSizeHooks = (width: number, height: number) => {
  const wrapper = createGeneratorConfigFormWrapper({
    overrides: { width, height },
    onMethods: (methods) => {
      form = methods
    }
  })

  return renderHook(
    () => {
      useImageSizeFamilySync()
      return useImageSizePreset()
    },
    { wrapper }
  )
}

const loadFamily = (family: ModelFamily) => {
  act(() => {
    useModelSelectorStore.setState({ loaded_model_family: family })
  })
}

const size = () => ({
  width: form.getValues('width'),
  height: form.getValues('height')
})

describe('image size presets', () => {
  beforeEach(() => {
    useImageSizeStore.setState({
      family: ModelFamily.UNKNOWN,
      isCustomChosen: false
    })
    useModelSelectorStore.setState({
      loaded_model_family: ModelFamily.UNKNOWN
    })
  })

  it('sets the SDXL size for a picked preset', () => {
    const { result } = renderSizeHooks(1024, 1024)
    loadFamily(ModelFamily.SDXL)

    act(() => {
      result.current.onPresetChange(new Set([ImageSizePreset.LANDSCAPE]))
    })

    expect(size()).toEqual({ width: 1152, height: 896 })
    expect(result.current.selectedPreset).toBe(ImageSizePreset.LANDSCAPE)
  })

  it('shows Custom for a stored size that matches no preset, without changing it', () => {
    const { result } = renderSizeHooks(1000, 700)
    loadFamily(ModelFamily.SDXL)

    expect(result.current.selectedPreset).toBe(ImageSizePreset.CUSTOM)
    expect(size()).toEqual({ width: 1000, height: 700 })
  })

  it('moves a preset to the new family when the model family changes', () => {
    renderSizeHooks(704, 384)
    loadFamily(ModelFamily.SD15)

    loadFamily(ModelFamily.SDXL)

    expect(size()).toEqual({ width: 1344, height: 768 })
  })

  it('keeps the size when a reload passes through the unknown family', () => {
    renderSizeHooks(1024, 1024)
    loadFamily(ModelFamily.SDXL)

    loadFamily(ModelFamily.UNKNOWN)
    loadFamily(ModelFamily.SDXL)

    expect(size()).toEqual({ width: 1024, height: 1024 })
  })

  it('keeps Custom through a swap that lands on a preset size', () => {
    const { result } = renderSizeHooks(1152, 896)
    loadFamily(ModelFamily.SDXL)

    act(() => {
      result.current.onPresetChange(new Set([ImageSizePreset.CUSTOM]))
    })
    act(() => {
      result.current.onSwap()
    })

    expect(size()).toEqual({ width: 896, height: 1152 })
    expect(result.current.selectedPreset).toBe(ImageSizePreset.CUSTOM)
    expect(result.current.isCustom).toBe(true)
  })

  it('leaves a Custom size alone when the family changes', () => {
    renderSizeHooks(512, 512)
    loadFamily(ModelFamily.SD15)
    act(() => {
      IMAGE_SIZE_ACTIONS.setCustomChosen(true)
    })

    loadFamily(ModelFamily.SDXL)

    expect(size()).toEqual({ width: 512, height: 512 })
  })
})
