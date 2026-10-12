import { createGeneratorConfigFormWrapper } from '@/cores/test-utils'
import { useGeneratorSubmit } from '@/features/generators/states'
import { GenerateBlockReason } from '@/features/generators/types'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GeneratorDock } from '../GeneratorDock'

vi.mock('@/features/generators/states', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/generators/states')>()),
  useGeneratorSubmit: vi.fn()
}))
vi.mock('../GeneratorDockPills', () => ({
  GeneratorDockPills: () => <div>Pills</div>
}))

const onSubmit = vi.fn()

const mockSubmit = (disabledReason?: GenerateBlockReason) => {
  vi.mocked(useGeneratorSubmit).mockReturnValue({
    onSubmit,
    isDisabled: Boolean(disabledReason),
    isGenerating: false,
    disabledReason
  })
}

const renderDock = (negativePrompt = '') =>
  render(<GeneratorDock />, {
    wrapper: createGeneratorConfigFormWrapper({
      overrides: { prompt: 'a lighthouse', negative_prompt: negativePrompt }
    })
  })

describe('GeneratorDock', () => {
  beforeEach(() => {
    onSubmit.mockClear()
  })

  it('submits on Ctrl+Enter from the prompt', async () => {
    const user = userEvent.setup()
    mockSubmit()
    renderDock()

    await user.click(screen.getByRole('textbox', { name: 'Prompt' }))
    await user.keyboard('{Control>}{Enter}{/Control}')

    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('shows the reason and disables Generate when a run cannot start', () => {
    mockSubmit(GenerateBlockReason.BACKEND_OFFLINE)
    renderDock()

    expect(screen.getByText('Backend offline')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Generate' })).toBeDisabled()
  })

  it('reveals the negative prompt from the toggle', async () => {
    const user = userEvent.setup()
    mockSubmit()
    renderDock()

    expect(
      screen.queryByRole('textbox', { name: 'Negative prompt' })
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Negative prompt' }))

    expect(
      screen.getByRole('textbox', { name: 'Negative prompt' })
    ).toBeInTheDocument()
  })

  it('shows a negative prompt that is already set', () => {
    mockSubmit()
    renderDock('blurry, watermark')

    expect(
      screen.getByRole('textbox', { name: 'Negative prompt' })
    ).toHaveValue('blurry, watermark')
  })
})
