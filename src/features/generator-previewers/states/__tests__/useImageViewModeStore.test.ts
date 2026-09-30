import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  IMAGE_VIEW_MODE_ACTIONS,
  ImageViewMode,
  useImageViewModeStore
} from '../useImageViewModeStore'

beforeEach(() => {
  useImageViewModeStore.setState({ viewMode: ImageViewMode.GRID })
})

describe('useImageViewModeStore - initialization', () => {
  it('starts in single view', () => {
    expect(useImageViewModeStore.getInitialState().viewMode).toBe(
      ImageViewMode.SLIDER
    )
  })

  it('holds only data in the store state', () => {
    expect(Object.keys(useImageViewModeStore.getState())).toEqual(['viewMode'])
  })
})

describe('IMAGE_VIEW_MODE_ACTIONS.setViewMode', () => {
  it('switches to slider view', () => {
    IMAGE_VIEW_MODE_ACTIONS.setViewMode(ImageViewMode.SLIDER)

    expect(useImageViewModeStore.getState().viewMode).toBe(ImageViewMode.SLIDER)
  })

  it('switches back to grid view', () => {
    IMAGE_VIEW_MODE_ACTIONS.setViewMode(ImageViewMode.SLIDER)
    IMAGE_VIEW_MODE_ACTIONS.setViewMode(ImageViewMode.GRID)

    expect(useImageViewModeStore.getState().viewMode).toBe(ImageViewMode.GRID)
  })

  it('keeps the same mode when set repeatedly', () => {
    IMAGE_VIEW_MODE_ACTIONS.setViewMode(ImageViewMode.SLIDER)
    IMAGE_VIEW_MODE_ACTIONS.setViewMode(ImageViewMode.SLIDER)

    expect(useImageViewModeStore.getState().viewMode).toBe(ImageViewMode.SLIDER)
  })

  it('ends on the last mode after rapid changes', () => {
    for (let changeCount = 0; changeCount < 9; changeCount++) {
      IMAGE_VIEW_MODE_ACTIONS.setViewMode(
        changeCount % 2 === 0 ? ImageViewMode.SLIDER : ImageViewMode.GRID
      )
    }

    expect(useImageViewModeStore.getState().viewMode).toBe(ImageViewMode.SLIDER)
  })
})

describe('useImageViewModeStore - subscribers', () => {
  it('shares state across hook instances and re-renders them', () => {
    const first = renderHook(() =>
      useImageViewModeStore((state) => state.viewMode)
    )
    const second = renderHook(() =>
      useImageViewModeStore((state) => state.viewMode)
    )

    act(() => {
      IMAGE_VIEW_MODE_ACTIONS.setViewMode(ImageViewMode.SLIDER)
    })

    expect(first.result.current).toBe(ImageViewMode.SLIDER)
    expect(second.result.current).toBe(ImageViewMode.SLIDER)
  })
})
