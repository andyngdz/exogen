import { createCapturedGeneratorConfigFormWrapper } from '@/cores/test-utils'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { COMMON_STEPS } from '../../constants'
import { GeneratorConfigCommonSteps } from '../GeneratorConfigCommonSteps'

// Mock constants to test with
vi.mock('../../constants', () => ({
  COMMON_STEPS: [16, 24, 32]
}))

const { Wrapper, getMethods } = createCapturedGeneratorConfigFormWrapper()

describe('GeneratorConfigCommonSteps', () => {
  it('should render buttons for each common step value', () => {
    render(<GeneratorConfigCommonSteps />, { wrapper: Wrapper })

    // Check that all buttons from COMMON_STEPS are rendered
    COMMON_STEPS.forEach((step) => {
      expect(
        screen.getByRole('button', { name: step.toString() })
      ).toBeInTheDocument()
    })
  })

  it('updates the form value when a step button is pressed', async () => {
    const user = userEvent.setup()

    render(<GeneratorConfigCommonSteps />, { wrapper: Wrapper })

    // Click on the first button (16)
    const firstStepButton = screen.getByRole('button', { name: '16' })
    await user.click(firstStepButton)

    expect(getMethods().getValues('steps')).toBe(16)

    // Click on the third button (32)
    const thirdStepButton = screen.getByRole('button', { name: '32' })
    await user.click(thirdStepButton)

    expect(getMethods().getValues('steps')).toBe(32)
  })

  it('should render buttons with light variant and proper styling', () => {
    render(<GeneratorConfigCommonSteps />, { wrapper: Wrapper })

    // Get all buttons
    const buttons = screen.getAllByRole('button')

    // Check number of buttons matches COMMON_STEPS length
    expect(buttons).toHaveLength(COMMON_STEPS.length)

    // Check each button has the light variant class
    buttons.forEach((button) => {
      expect(button).toHaveAttribute(
        'class',
        expect.stringContaining('text-default-700')
      )
    })
  })
})
