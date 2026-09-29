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

const getSelectTrigger = () =>
  screen.getByRole('button', { name: /Upscale Factor/ })

const chooseFactor = async (label: string) => {
  const user = userEvent.setup()
  await user.click(getSelectTrigger())
  await user.click(screen.getByRole('option', { name: label }))
}

describe('GeneratorConfigHiresFixUpscaleFactor', () => {
  it('renders the labelled select with the selected value', () => {
    renderUpscaleFactor(UpscaleFactor.TWO)

    expect(getSelectTrigger()).toHaveTextContent('2x')
  })

  it('displays all upscale factor options', async () => {
    const user = userEvent.setup()
    renderUpscaleFactor(UpscaleFactor.TWO)

    await user.click(getSelectTrigger())

    for (const label of ['1.5x', '2x', '3x', '4x']) {
      expect(screen.getByRole('option', { name: label })).toBeInTheDocument()
    }
  })

  it('writes the chosen factor to the form as a number', async () => {
    const { getMethods } = renderUpscaleFactor(UpscaleFactor.TWO)

    await chooseFactor('1.5x')

    expect(getMethods().getValues('hires_fix.upscale_factor')).toBe(1.5)
    expect(getSelectTrigger()).toHaveTextContent('1.5x')
  })

  it('handles each factor value', async () => {
    const { getMethods } = renderUpscaleFactor(UpscaleFactor.TWO)

    await chooseFactor('4x')
    expect(getMethods().getValues('hires_fix.upscale_factor')).toBe(4)

    await chooseFactor('3x')
    expect(getMethods().getValues('hires_fix.upscale_factor')).toBe(3)
  })

  it('shows the loader while the form has no upscale factor', () => {
    const { container } = renderUpscaleFactor()

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(container.firstElementChild).toHaveClass('skeleton', 'h-14')
  })
})
