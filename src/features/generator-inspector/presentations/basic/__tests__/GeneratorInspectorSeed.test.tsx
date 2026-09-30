import { createCapturedGeneratorConfigFormWrapper } from '@/cores/test-utils'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { GeneratorInspectorSeed } from '../GeneratorInspectorSeed'
import { GeneratorInspectorSeedRandom } from '../GeneratorInspectorSeedRandom'

const renderSeed = (seed: number) => {
  const { Wrapper, getMethods } = createCapturedGeneratorConfigFormWrapper({
    overrides: { seed }
  })

  render(
    <>
      <GeneratorInspectorSeedRandom />
      <GeneratorInspectorSeed />
    </>,
    { wrapper: Wrapper }
  )

  return { getMethods }
}

describe('GeneratorInspectorSeed', () => {
  it('shows a fixed seed with the Random switch off', () => {
    renderSeed(1193044871)

    expect(screen.getByRole('switch', { name: 'Random' })).not.toBeChecked()
    expect(screen.getByLabelText('Seed')).toHaveValue('1193044871')
  })

  it('switches between a random seed and a fresh fixed one', async () => {
    const user = userEvent.setup()
    const { getMethods } = renderSeed(42)

    await user.click(screen.getByRole('switch', { name: 'Random' }))

    expect(getMethods().getValues('seed')).toBe(-1)
    expect(screen.queryByLabelText('Seed')).not.toBeInTheDocument()
    expect(screen.getByText(/Each run picks a new seed/)).toBeInTheDocument()

    await user.click(screen.getByRole('switch', { name: 'Random' }))

    expect(getMethods().getValues('seed')).toBeGreaterThanOrEqual(0)
    expect(screen.getByLabelText('Seed')).toBeInTheDocument()
  })
})
