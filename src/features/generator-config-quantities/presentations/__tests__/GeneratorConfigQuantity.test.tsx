import { createGeneratorConfigFormWrapper } from '@/cores/test-utils'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { GeneratorConfigQuantity } from '../GeneratorConfigQuantity'

const Wrapper = createGeneratorConfigFormWrapper({
  overrides: { number_of_images: 4 }
})

describe('GeneratorConfigQuantity', () => {
  it("should render the component with 'Quantity' heading", () => {
    render(<GeneratorConfigQuantity />, { wrapper: Wrapper })

    expect(screen.getByText('Quantity')).toBeInTheDocument()
  })

  it('should render number input for number_of_images', () => {
    render(<GeneratorConfigQuantity />, { wrapper: Wrapper })

    expect(
      screen.getByRole('textbox', { name: 'Number of images' })
    ).toHaveValue('4')
    expect(screen.getByText('Images')).toBeInTheDocument()
  })

  it('should show the tooltip content when the info icon is focused', async () => {
    const user = userEvent.setup()
    render(<GeneratorConfigQuantity />, { wrapper: Wrapper })

    await user.tab()
    await user.tab()

    expect(
      screen.getByRole('button', { name: 'About number of images' })
    ).toHaveFocus()

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Number of images will be generated'
    )
  })
})
