import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GeneratorConfigStyleEmptyState } from '../GeneratorConfigStyleEmptyState'

describe('GeneratorConfigStyleEmptyState', () => {
  it('renders empty state message with query', () => {
    render(<GeneratorConfigStyleEmptyState query="portrait" />)

    expect(
      screen.getByText('No styles found matching "portrait"')
    ).toBeInTheDocument()
  })

  it('displays suggestion text', () => {
    render(<GeneratorConfigStyleEmptyState query="test" />)

    expect(
      screen.getByText('Try different keywords or browse all styles')
    ).toBeInTheDocument()
  })

  it('displays query text in message', () => {
    render(<GeneratorConfigStyleEmptyState query="anime landscape" />)

    expect(
      screen.getByText('No styles found matching "anime landscape"')
    ).toBeInTheDocument()
  })

  it('has centered layout styling', () => {
    const { container } = render(
      <GeneratorConfigStyleEmptyState query="test" />
    )

    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('flex', 'flex-col', 'items-center')
  })
})
