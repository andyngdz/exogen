import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GeneratorConfigStyleSearchInput } from '../GeneratorConfigStyleSearchInput'

const getSearchBox = () =>
  screen.getByRole('searchbox', { name: 'Search styles' })

describe('GeneratorConfigStyleSearchInput', () => {
  it('renders a labelled search box with placeholder', () => {
    render(
      <GeneratorConfigStyleSearchInput
        value=""
        onChange={vi.fn()}
        onClear={vi.fn()}
      />
    )

    expect(getSearchBox()).toHaveAttribute(
      'placeholder',
      'Search styles by name, category, or keywords...'
    )
  })

  it('displays current value', () => {
    render(
      <GeneratorConfigStyleSearchInput
        value="portrait"
        onChange={vi.fn()}
        onClear={vi.fn()}
      />
    )

    expect(getSearchBox()).toHaveValue('portrait')
  })

  it('calls onChange when user types', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(
      <GeneratorConfigStyleSearchInput
        value=""
        onChange={handleChange}
        onClear={vi.fn()}
      />
    )

    await user.type(getSearchBox(), 'a')

    expect(handleChange).toHaveBeenCalledWith('a')
  })

  it('calls onClear when clear button is clicked', async () => {
    const user = userEvent.setup()
    const handleClear = vi.fn()

    render(
      <GeneratorConfigStyleSearchInput
        value="portrait"
        onChange={vi.fn()}
        onClear={handleClear}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Clear search' }))

    expect(handleClear).toHaveBeenCalledOnce()
  })

  it('calls onClear when Escape is pressed', async () => {
    const user = userEvent.setup()
    const handleClear = vi.fn()

    render(
      <GeneratorConfigStyleSearchInput
        value="portrait"
        onChange={vi.fn()}
        onClear={handleClear}
      />
    )

    await user.type(getSearchBox(), '{Escape}')

    expect(handleClear).toHaveBeenCalledOnce()
  })
})
