import { UpscaleFactor, UpscalerType } from '@/cores/constants'
import { createCapturedGeneratorConfigFormWrapper } from '@/cores/test-utils'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { GeneratorConfigHiresFixUpscaleFactor } from '../GeneratorConfigHiresFixUpscaleFactor'

const renderUpscaleFactor = (upscaleFactor?: UpscaleFactor) => {
  const { Wrapper, getMethods } = createCapturedGeneratorConfigFormWrapper({
    overrides: upscaleFactor
      ? {
          hires_fix: {
            upscale_factor: upscaleFactor,
            upscaler: UpscalerType.LANCZOS,
            denoising_strength: 0.7,
            steps: 0
          }
        }
      : {}
  })

  const view = render(<GeneratorConfigHiresFixUpscaleFactor />, {
    wrapper: Wrapper
  })

  return { ...view, getMethods }
}

const factor = (label: string) => screen.getByRole('radio', { name: label })

describe('GeneratorConfigHiresFixUpscaleFactor', () => {
  it('shows every factor with the current one selected', () => {
    renderUpscaleFactor(UpscaleFactor.TWO)

    for (const label of ['1.5x', '2x', '3x', '4x']) {
      expect(factor(label)).toBeInTheDocument()
    }
    expect(factor('2x')).toBeChecked()
  })

  it('writes the chosen factor to the form as a number', async () => {
    const user = userEvent.setup()
    const { getMethods } = renderUpscaleFactor(UpscaleFactor.TWO)

    await user.click(factor('1.5x'))
    expect(getMethods().getValues('hires_fix.upscale_factor')).toBe(1.5)
    expect(factor('1.5x')).toBeChecked()

    await user.click(factor('4x'))
    expect(getMethods().getValues('hires_fix.upscale_factor')).toBe(4)
  })

  it('keeps the factor when the selected one is pressed again', async () => {
    const user = userEvent.setup()
    const { getMethods } = renderUpscaleFactor(UpscaleFactor.TWO)

    await user.click(factor('2x'))

    expect(getMethods().getValues('hires_fix.upscale_factor')).toBe(2)
  })

  it('shows the loader while the form has no upscale factor', () => {
    const { container } = renderUpscaleFactor()

    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(container.firstElementChild).toHaveClass('skeleton', 'h-14')
  })
})
