import { create } from 'zustand'

export enum ImageViewMode {
  GRID = 'grid',
  SLIDER = 'slider'
}

interface ImageViewModeState {
  viewMode: ImageViewMode
}

export const useImageViewModeStore = create<ImageViewModeState>()(() => ({
  viewMode: ImageViewMode.GRID
}))

export const IMAGE_VIEW_MODE_ACTIONS = {
  setViewMode: (viewMode: ImageViewMode) =>
    useImageViewModeStore.setState({ viewMode })
}
