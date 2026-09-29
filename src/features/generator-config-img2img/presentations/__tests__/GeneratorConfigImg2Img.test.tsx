import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GeneratorMode, Image2ImageResizeMode } from '@/types'
import { GeneratorConfigImg2Img } from '../GeneratorConfigImg2Img'

const modeState: { mode: GeneratorMode } = {
  mode: GeneratorMode.TEXT_2_IMAGE
}

const img2imgState = {
  strength: 0.5,
  resizeMode: Image2ImageResizeMode.RESIZE,
  setStrength: vi.fn(),
  setResizeMode: vi.fn()
}

vi.mock('@/features/generators', () => ({
  useGeneratorModeStore: <R,>(selector: (state: typeof modeState) => R) =>
    selector(modeState),
  useImage2ImageConfigStore: <R,>(
    selector: (state: typeof img2imgState) => R
  ) => selector(img2imgState)
}))

describe('GeneratorConfigImg2Img', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    modeState.mode = GeneratorMode.IMAGE_2_IMAGE
  })

  it('renders nothing when mode is not IMAGE_2_IMAGE', () => {
    modeState.mode = GeneratorMode.TEXT_2_IMAGE
    const { container } = render(<GeneratorConfigImg2Img />)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders the strength slider and resize mode select', () => {
    render(<GeneratorConfigImg2Img />)

    expect(screen.getByText('Image to Image')).toBeInTheDocument()
    expect(
      screen.getByRole('slider', { name: 'Denoising Strength' })
    ).toHaveValue('0.5')
    expect(
      screen.getByRole('button', { name: /Resize Mode/ })
    ).toHaveTextContent('Resize')
  })

  it('stores the new strength when the slider moves', () => {
    render(<GeneratorConfigImg2Img />)

    fireEvent.change(
      screen.getByRole('slider', { name: 'Denoising Strength' }),
      { target: { value: '0.75' } }
    )

    expect(img2imgState.setStrength).toHaveBeenCalledWith(0.75)
  })

  it('stores the chosen resize mode', async () => {
    const user = userEvent.setup()
    render(<GeneratorConfigImg2Img />)

    await user.click(screen.getByRole('button', { name: /Resize Mode/ }))
    await user.click(screen.getByRole('option', { name: 'Crop' }))

    expect(img2imgState.setResizeMode).toHaveBeenCalledWith(
      Image2ImageResizeMode.CROP
    )
  })
})
