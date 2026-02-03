import { createCapturedGeneratorConfigFormWrapper } from '@/cores/test-utils'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { seedService } from '../../services/seed'
import { GeneratorConfigSeed } from '../GeneratorConfigSeed'

// Mock dependencies
vi.mock('@/cores/presentations/NumberInputController', () => ({
  NumberInputController: ({
    'aria-label': ariaLabel,
    controlName,
    startContent
  }: {
    'aria-label': string
    controlName: string
    startContent: ReactNode
    [key: string]: unknown
  }) => (
    <div data-testid={`number-input-${controlName}`}>
      <span>{ariaLabel}</span>
      {startContent}
    </div>
  )
}))

vi.mock('../../services/seed', () => ({
  seedService: {
    generate: vi.fn().mockReturnValue(12345)
  }
}))

const { Wrapper, getMethods } = createCapturedGeneratorConfigFormWrapper()

describe('GeneratorConfigSeed', () => {
  it("should render the component with 'Seed' heading", () => {
    render(<GeneratorConfigSeed />, { wrapper: Wrapper })

    expect(
      screen.getByText('Seed', { selector: 'span.font-semibold' })
    ).toBeInTheDocument()
  })

  it('should render number input for seed value', () => {
    render(<GeneratorConfigSeed />, { wrapper: Wrapper })

    expect(screen.getByTestId('number-input-seed')).toBeInTheDocument()
    expect(screen.getByText('Value')).toBeInTheDocument()
  })

  it('should render a dice button to generate random seed', () => {
    render(<GeneratorConfigSeed />, { wrapper: Wrapper })

    // Check that a button is present
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBe(1) // Should be one button
  })

  it('generates a seed and updates the form value', async () => {
    const user = userEvent.setup()

    render(<GeneratorConfigSeed />, { wrapper: Wrapper })

    // Click on the dice button
    const diceButton = screen.getByRole('button')
    await user.click(diceButton)

    // Verify that seedService.generate was called
    expect(seedService.generate).toHaveBeenCalled()

    expect(getMethods().getValues('seed')).toBe(12345)
  })
})
