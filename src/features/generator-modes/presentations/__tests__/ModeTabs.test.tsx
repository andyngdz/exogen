import { GeneratorMode } from '@/types'
import {
  useGeneratorModeStore,
  useImage2ImageConfigStore
} from '@/features/generators'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ModeTabs } from '../ModeTabs'

vi.mock('../Text2ImagePanel', () => ({
  Text2ImagePanel: () => <div data-testid="txt2img-panel" />
}))

vi.mock('../Image2ImagePanel', () => ({
  Image2ImagePanel: () => <div data-testid="img2img-panel" />
}))

describe('ModeTabs', () => {
  afterEach(() => {
    useGeneratorModeStore.getState().reset()
    useImage2ImageConfigStore.getState().reset()
  })

  it('defaults to TEXT_2_IMAGE', () => {
    render(<ModeTabs />)

    expect(screen.getByRole('tab', { name: 'Text to Image' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(screen.getByTestId('txt2img-panel')).toBeInTheDocument()
    expect(screen.queryByTestId('img2img-panel')).not.toBeInTheDocument()
  })

  it('switches to IMAGE_2_IMAGE when its tab is chosen', async () => {
    const user = userEvent.setup()
    render(<ModeTabs />)

    await user.click(screen.getByRole('tab', { name: 'Image to Image' }))

    expect(useGeneratorModeStore.getState().mode).toBe(
      GeneratorMode.IMAGE_2_IMAGE
    )
    expect(screen.getByTestId('img2img-panel')).toBeInTheDocument()
  })

  it('clears init image when switching to TEXT_2_IMAGE', async () => {
    const user = userEvent.setup()
    useGeneratorModeStore.getState().setMode(GeneratorMode.IMAGE_2_IMAGE)
    useImage2ImageConfigStore
      .getState()
      .setInitImageBase64('data:image/png;base64,abc')

    render(<ModeTabs />)

    await user.click(screen.getByRole('tab', { name: 'Text to Image' }))

    expect(useGeneratorModeStore.getState().mode).toBe(
      GeneratorMode.TEXT_2_IMAGE
    )
    expect(useImage2ImageConfigStore.getState().initImageBase64).toBeUndefined()
  })
})
