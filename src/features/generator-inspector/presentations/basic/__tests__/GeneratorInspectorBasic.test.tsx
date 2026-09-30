import { createGeneratorConfigFormWrapper } from '@/cores/test-utils'
import { useImageSizeStore } from '@/features/generator-inspector/states/useImageSizeStore'
import { useGeneratorModeStore } from '@/features/generators'
import { GeneratorMode, ModelFamily } from '@/types'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GeneratorInspectorBasic } from '../GeneratorInspectorBasic'

vi.mock(
  '@/features/generator-config-sampling/presentations/GeneratorConfigSamplerDropdown',
  () => ({ GeneratorConfigSamplerDropdown: () => <div>Sampler select</div> })
)

const renderBasic = (width = 1024, height = 1024) =>
  render(<GeneratorInspectorBasic />, {
    wrapper: createGeneratorConfigFormWrapper({ overrides: { width, height } })
  })

describe('GeneratorInspectorBasic', () => {
  beforeEach(() => {
    useImageSizeStore.setState({
      family: ModelFamily.SDXL,
      isCustomChosen: false
    })
    useGeneratorModeStore.setState({ mode: GeneratorMode.TEXT_2_IMAGE })
  })

  it('shows the selected preset and its size', () => {
    renderBasic()

    expect(screen.getByRole('radio', { name: '1:1' })).toBeChecked()
    expect(screen.getByText('1024 × 1024')).toBeInTheDocument()
    expect(screen.queryByLabelText('Width')).not.toBeInTheDocument()
  })

  it('applies a preset sized for the loaded family', async () => {
    const user = userEvent.setup()
    renderBasic()

    await user.click(screen.getByRole('radio', { name: '4:3' }))

    expect(screen.getByText('1152 × 896')).toBeInTheDocument()
  })

  it('shows width, height and swap for a size that matches no preset', async () => {
    const user = userEvent.setup()
    renderBasic(1000, 704)

    expect(screen.getByRole('radio', { name: 'Custom' })).toBeChecked()
    expect(screen.getByLabelText('Width')).toHaveValue('1000')

    await user.click(
      screen.getByRole('button', { name: 'Swap width and height' })
    )

    expect(screen.getByLabelText('Width')).toHaveValue('704')
    expect(screen.getByLabelText('Height')).toHaveValue('1000')
  })

  it('shows the image to image section only in image mode', () => {
    const { rerender } = renderBasic()
    expect(screen.queryByText('Denoising strength')).not.toBeInTheDocument()

    useGeneratorModeStore.setState({ mode: GeneratorMode.IMAGE_2_IMAGE })
    rerender(<GeneratorInspectorBasic />)

    expect(screen.getByText('Denoising strength')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Resize' })).toBeInTheDocument()
  })

  it('shows the sliders with their values', () => {
    renderBasic()

    expect(
      screen.getByRole('slider', { name: 'Images per run' })
    ).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Steps' })).toBeInTheDocument()
    expect(
      screen.getByRole('slider', { name: 'CFG scale' })
    ).toBeInTheDocument()
  })
})
