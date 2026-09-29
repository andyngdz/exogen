import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ModelRecommendationsHeader } from '../ModelRecommendationsHeader'

// Mock the ModelRecommendationsBadge component
vi.mock('../ModelRecommendationsBadge', () => ({
  ModelRecommendationsBadge: () => (
    <div data-testid="mock-recommendations-badge">Badge</div>
  )
}))

describe('ModelRecommendationsHeader', () => {
  const defaultProps = {
    title: 'Test Model',
    description: 'This is a test description',
    isRecommended: false
  }

  it('renders title and description correctly', () => {
    render(<ModelRecommendationsHeader {...defaultProps} />)

    expect(screen.getByText('Test Model')).toBeInTheDocument()
    expect(screen.getByText('This is a test description')).toBeInTheDocument()
  })

  it('does not show the badge when not recommended', () => {
    render(<ModelRecommendationsHeader {...defaultProps} />)

    expect(
      screen.queryByTestId('mock-recommendations-badge')
    ).not.toBeInTheDocument()
  })

  it('shows the badge when recommended', () => {
    render(
      <ModelRecommendationsHeader {...defaultProps} isRecommended={true} />
    )

    expect(screen.getByTestId('mock-recommendations-badge')).toBeInTheDocument()
  })

  it('applies primary text color when recommended', () => {
    render(
      <ModelRecommendationsHeader {...defaultProps} isRecommended={true} />
    )

    const title = screen.getByText('Test Model')
    expect(title).toHaveClass('text-accent')
    expect(title).not.toHaveClass('text-base-content')
  })

  it('applies base text color when not recommended', () => {
    render(
      <ModelRecommendationsHeader {...defaultProps} isRecommended={false} />
    )

    const title = screen.getByText('Test Model')
    expect(title).toHaveClass('text-base-content')
    expect(title).not.toHaveClass('text-accent')
  })

  it('applies correct styling to the layout', () => {
    const { container } = render(
      <ModelRecommendationsHeader {...defaultProps} />
    )

    // Check main container has the expected classes
    const mainDiv = container.firstChild
    expect(mainDiv).toHaveClass('flex')
    expect(mainDiv).toHaveClass('flex-col')

    // Check title container has the expected classes
    const titleContainer = screen.getByText('Test Model').parentElement
    expect(titleContainer).toHaveClass('flex')
    expect(titleContainer).toHaveClass('items-center')
    expect(titleContainer).toHaveClass('gap-2')

    // Check description has the expected classes
    const description = screen.getByText('This is a test description')
    expect(description).toHaveClass('text-muted-content')
    expect(description).toHaveClass('leading-relaxed')
  })
})
