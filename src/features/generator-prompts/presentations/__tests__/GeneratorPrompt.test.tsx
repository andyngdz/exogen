import { createCapturedGeneratorConfigFormWrapper } from '@/cores/test-utils'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { GeneratorPrompt } from '../GeneratorPrompt'

const renderPrompt = () => {
  const { Wrapper, getMethods } = createCapturedGeneratorConfigFormWrapper({
    overrides: { prompt: 'a cat', negative_prompt: 'blurry' }
  })

  render(<GeneratorPrompt />, { wrapper: Wrapper })

  return { getMethods }
}

const getPrompt = () => screen.getByRole('textbox', { name: 'Prompt' })
const getNegativePrompt = () =>
  screen.getByRole('textbox', { name: 'Negative prompt' })

describe('GeneratorPrompt', () => {
  it('should render prompt and negative prompt text areas with form values', () => {
    renderPrompt()

    expect(getPrompt()).toHaveValue('a cat')
    expect(getPrompt()).not.toHaveAttribute('aria-invalid')
    expect(getNegativePrompt()).toHaveValue('blurry')
  })

  it('should write typed text back to the form', async () => {
    const user = userEvent.setup()
    const { getMethods } = renderPrompt()

    await user.type(getPrompt(), ', sitting')
    await user.type(getNegativePrompt(), ', noisy')

    expect(getMethods().getValues('prompt')).toBe('a cat, sitting')
    expect(getMethods().getValues('negative_prompt')).toBe('blurry, noisy')
  })

  it('should render error state on the prompt only when it is empty', async () => {
    const user = userEvent.setup()
    const { getMethods } = renderPrompt()

    await user.clear(getPrompt())
    await act(async () => {
      await getMethods().trigger()
    })

    expect(getPrompt()).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Prompt is required')).toBeInTheDocument()
    expect(getNegativePrompt()).not.toHaveAttribute('aria-invalid')
  })

  it('should pass maxLength to both text areas', () => {
    renderPrompt()

    expect(getPrompt()).toHaveAttribute('maxlength', '1000')
    expect(getNegativePrompt()).toHaveAttribute('maxlength', '1000')
  })
})
