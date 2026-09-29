import { UpscaleFactor, UpscalerType } from '@/cores/constants'
import { createCapturedGeneratorConfigFormWrapper } from '@/cores/test-utils'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GeneratorConfigHiresFix } from '../GeneratorConfigHiresFix'

// Mock child components
vi.mock('../GeneratorConfigHiresFixUpscaleFactor', () => ({
  GeneratorConfigHiresFixUpscaleFactor: () => (
    <div data-testid="upscale-factor">Upscale Factor</div>
  )
}))

vi.mock('../GeneratorConfigHiresFixUpscaler', () => ({
  GeneratorConfigHiresFixUpscaler: () => (
    <div data-testid="upscaler">Upscaler</div>
  )
}))

const renderHiresFix = () => {
  const { Wrapper, getMethods } = createCapturedGeneratorConfigFormWrapper({
    overrides: {
      hires_fix: {
        upscale_factor: UpscaleFactor.TWO,
        upscaler: UpscalerType.REAL_ESRGAN_X2_PLUS,
        denoising_strength: 0.7,
        steps: 0
      }
    }
  })

  render(<GeneratorConfigHiresFix />, { wrapper: Wrapper })

  return { getMethods }
}

const getDenoisingSlider = () =>
  screen.getByRole('slider', { name: 'Denoising Strength' })

describe('GeneratorConfigHiresFix', () => {
  it('renders the upscale factor and upscaler components', () => {
    renderHiresFix()

    expect(screen.getByTestId('upscale-factor')).toBeInTheDocument()
    expect(screen.getByTestId('upscaler')).toBeInTheDocument()
  })

  it('renders hires steps input with its description', () => {
    renderHiresFix()

    expect(screen.getByRole('textbox', { name: 'Hires Steps' })).toHaveValue(
      '0'
    )
    expect(screen.getByText('0 = use same as base steps')).toBeInTheDocument()
  })

  it('denoising slider has correct range', () => {
    renderHiresFix()
    const slider = getDenoisingSlider()

    expect(slider).toHaveAttribute('min', '0')
    expect(slider).toHaveAttribute('max', '1')
    expect(slider).toHaveAttribute('step', '0.05')
  })

  it('denoising slider displays current value', () => {
    renderHiresFix()

    expect(getDenoisingSlider()).toHaveValue('0.7')
    expect(screen.getByText('0.7')).toBeInTheDocument()
  })

  it('writes the new denoising strength to the form', () => {
    const { getMethods } = renderHiresFix()

    fireEvent.change(getDenoisingSlider(), { target: { value: '0.5' } })

    expect(getMethods().getValues('hires_fix.denoising_strength')).toBe(0.5)
  })
})
