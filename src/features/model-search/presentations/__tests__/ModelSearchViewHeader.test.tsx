import { render, screen } from '@testing-library/react'
import type { LucideProps } from 'lucide-react'
import type { FC } from 'react'
import { describe, expect, it } from 'vitest'

import { ModelSearchViewHeader } from '../ModelSearchViewHeader'

// Provide a lightweight Icon implementation to assert it renders and receives className
const DummyIcon: FC<LucideProps> = (props) => (
  <svg data-testid="icon" {...props} />
)

describe('ModelSearchViewHeader', () => {
  it('renders icon and title without action button when href is not provided', () => {
    // Arrange & Act
    render(<ModelSearchViewHeader Icon={DummyIcon} title="Model Card" />)

    // Assert
    const icon = screen.getByTestId('icon')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('text-accent')
    expect(screen.getByText('Model Card')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders external link button when href is provided', () => {
    // Arrange
    const href = 'https://huggingface.co/author/model'

    // Act
    render(
      <ModelSearchViewHeader Icon={DummyIcon} title="Model Card" href={href} />
    )

    // Assert
    const link = screen.getByRole('link', {
      name: 'Open Model Card on Hugging Face'
    })
    expect(link).toHaveAttribute('href', href)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveClass('button--ghost', 'button--icon-only')
  })
})
