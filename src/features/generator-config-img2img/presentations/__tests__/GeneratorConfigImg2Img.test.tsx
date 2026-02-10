import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

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
  useGeneratorModeStore: () => modeState,
  useImage2ImageConfigStore: () => img2imgState
}))

vi.mock('@heroui/react', () => ({
  Slider: ({ label }: { label: string }) => (
    <div data-testid="slider">{label}</div>
  ),
  Select: ({
    label,
    children
  }: {
    label: string
    children: React.ReactNode
  }) => (
    <div data-testid="select">
      <div>{label}</div>
      {children}
    </div>
  ),
  SelectItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )
}))

describe('GeneratorConfigImg2Img', () => {
  it('returns null when mode is not IMAGE_2_IMAGE', () => {
    modeState.mode = GeneratorMode.TEXT_2_IMAGE
    const { container } = render(<GeneratorConfigImg2Img />)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders controls when mode is IMAGE_2_IMAGE', () => {
    modeState.mode = GeneratorMode.IMAGE_2_IMAGE
    render(<GeneratorConfigImg2Img />)

    expect(screen.getByText('Image to Image')).toBeInTheDocument()
    expect(screen.getByTestId('slider')).toHaveTextContent('Denoising Strength')
    expect(screen.getByTestId('select')).toHaveTextContent('Resize Mode')
  })
})
