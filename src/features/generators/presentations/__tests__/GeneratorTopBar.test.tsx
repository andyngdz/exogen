import {
  ImageViewMode,
  useImageViewModeStore
} from '@/features/generator-previewers/states/useImageViewModeStore'
import {
  useGenerationErrorStore,
  useGeneratorModeStore
} from '@/features/generators/states'
import { GeneratorMode } from '@/types'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GeneratorTopBar } from '../GeneratorTopBar'

vi.mock('@/features/model-selectors/presentations/ModelSelector', () => ({
  ModelSelector: () => <div>Model</div>
}))

describe('GeneratorTopBar', () => {
  beforeEach(() => {
    useGeneratorModeStore.setState({ mode: GeneratorMode.TEXT_2_IMAGE })
    useImageViewModeStore.setState({ viewMode: ImageViewMode.SLIDER })
  })

  it('switches to image mode and clears the last failure', async () => {
    const user = userEvent.setup()
    useGenerationErrorStore.setState({ failure: { message: 'Out of memory' } })
    render(<GeneratorTopBar />)

    await user.click(screen.getByRole('radio', { name: 'Image to image' }))

    expect(useGeneratorModeStore.getState().mode).toBe(
      GeneratorMode.IMAGE_2_IMAGE
    )
    expect(useGenerationErrorStore.getState().failure).toBeUndefined()
  })

  it('switches between single and grid view', async () => {
    const user = userEvent.setup()
    render(<GeneratorTopBar />)

    expect(screen.getByRole('radio', { name: 'Single view' })).toBeChecked()

    await user.click(screen.getByRole('radio', { name: 'Grid view' }))

    expect(useImageViewModeStore.getState().viewMode).toBe(ImageViewMode.GRID)
  })
})
