import { createCapturedFormProviderWrapper } from '@/cores/test-utils'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { NumberInputController } from '../NumberInputController'

interface NumberFormValues {
  testNumber: number
}

const renderController = (element: React.ReactElement, defaultValue = 10) => {
  const { Wrapper, getMethods } =
    createCapturedFormProviderWrapper<NumberFormValues>({
      formOptions: { defaultValues: { testNumber: defaultValue } }
    })

  render(element, { wrapper: Wrapper })

  return { getMethods }
}

describe('NumberInputController', () => {
  it('renders the form value in a labelled number field', () => {
    renderController(
      <NumberInputController<NumberFormValues>
        controlName="testNumber"
        aria-label="Test number"
      />
    )

    expect(screen.getByRole('textbox', { name: 'Test number' })).toHaveValue(
      '10'
    )
  })

  it('formats the value with the given fraction digits and no grouping', () => {
    renderController(
      <NumberInputController<NumberFormValues>
        controlName="testNumber"
        aria-label="Test number"
        maximumFractionDigits={2}
      />,
      12345.678
    )

    expect(screen.getByRole('textbox', { name: 'Test number' })).toHaveValue(
      '12345.68'
    )
  })

  it('rounds to whole numbers by default', () => {
    renderController(
      <NumberInputController<NumberFormValues>
        controlName="testNumber"
        aria-label="Test number"
      />,
      7.6
    )

    expect(screen.getByRole('textbox', { name: 'Test number' })).toHaveValue(
      '8'
    )
  })

  it('writes the committed value back to the form', async () => {
    const user = userEvent.setup()
    const { getMethods } = renderController(
      <NumberInputController<NumberFormValues>
        controlName="testNumber"
        aria-label="Test number"
      />
    )

    const input = screen.getByRole('textbox', { name: 'Test number' })
    await user.clear(input)
    await user.type(input, '42')
    await user.tab()

    expect(getMethods().getValues('testNumber')).toBe(42)
  })

  it('shows the required error when the field is cleared', async () => {
    const user = userEvent.setup()
    const { getMethods } = renderController(
      <NumberInputController<NumberFormValues>
        controlName="testNumber"
        aria-label="Test number"
      />
    )

    const input = screen.getByRole('textbox', { name: 'Test number' })
    await user.clear(input)
    await user.tab()
    await act(async () => {
      await getMethods().trigger('testNumber')
    })

    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Input is required')).toBeInTheDocument()
  })
})
