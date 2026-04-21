import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GeneratorConfigStyleSearchInput } from '../GeneratorConfigStyleSearchInput'

vi.mock('lucide-react', () => ({
  Search: ({ size }: { size: number }) => (
    <svg data-testid="search-icon" width={size} height={size}>
      <title>Search</title>
    </svg>
  )
}))

vi.mock('@heroui/react', () => ({
  Input: vi.fn(
    ({
      value,
      onValueChange,
      onClear,
      isClearable,
      placeholder,
      startContent,
      ...props
    }: {
      value: string
      onValueChange: (value: string) => void
      onClear: VoidFunction
      isClearable: boolean
      placeholder: string
      startContent: React.ReactNode
      variant?: string
    }) => (
      <div data-slot="input-wrapper">
        {startContent}
        <input
          data-testid="hero-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          {...props}
        />
        {isClearable && (
          <button aria-label="clear" onClick={onClear}>
            Clear
          </button>
        )}
      </div>
    )
  )
}))

describe('GeneratorConfigStyleSearchInput', () => {
  it('renders search input with placeholder', () => {
    render(
      <GeneratorConfigStyleSearchInput
        value=""
        onChange={vi.fn()}
        onClear={vi.fn()}
      />
    )

    expect(
      screen.getByPlaceholderText(
        'Search styles by name, category, or keywords...'
      )
    ).toBeInTheDocument()
  })

  it('displays search icon', () => {
    render(
      <GeneratorConfigStyleSearchInput
        value=""
        onChange={vi.fn()}
        onClear={vi.fn()}
      />
    )

    const searchIcon = screen.getByTestId('search-icon')
    expect(searchIcon).toBeInTheDocument()
  })

  it('displays current value', () => {
    render(
      <GeneratorConfigStyleSearchInput
        value="portrait"
        onChange={vi.fn()}
        onClear={vi.fn()}
      />
    )

    const input = screen.getByDisplayValue('portrait')
    expect(input).toBeInTheDocument()
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

    const input = screen.getByPlaceholderText(
      'Search styles by name, category, or keywords...'
    )
    await user.type(input, 'anime')

    expect(handleChange).toHaveBeenCalled()
    expect(handleChange.mock.calls.length).toBeGreaterThan(0)
  })

  it('shows clear button when value is not empty', () => {
    render(
      <GeneratorConfigStyleSearchInput
        value="portrait"
        onChange={vi.fn()}
        onClear={vi.fn()}
      />
    )

    const clearButton = screen.getByRole('button', { name: /clear/i })
    expect(clearButton).toBeInTheDocument()
  })

  it('hides clear button when value is empty', () => {
    render(
      <GeneratorConfigStyleSearchInput
        value=""
        onChange={vi.fn()}
        onClear={vi.fn()}
      />
    )

    const clearButton = screen.queryByRole('button', { name: /clear/i })
    expect(clearButton).not.toBeInTheDocument()
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

    const clearButton = screen.getByRole('button', { name: /clear/i })
    await user.click(clearButton)

    expect(handleClear).toHaveBeenCalledOnce()
  })

  it('has bordered variant styling', () => {
    const { container } = render(
      <GeneratorConfigStyleSearchInput
        value=""
        onChange={vi.fn()}
        onClear={vi.fn()}
      />
    )

    const inputWrapper = container.querySelector('[data-slot="input-wrapper"]')
    expect(inputWrapper).toBeInTheDocument()
  })
})
