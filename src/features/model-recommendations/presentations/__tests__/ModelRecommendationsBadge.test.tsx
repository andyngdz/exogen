// src/features/model-recommendations/presentations/__tests__/ModelRecommendationsBadge.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ModelRecommendationsBadge } from '../ModelRecommendationsBadge'

describe('ModelRecommendationsBadge', () => {
  it('renders a Star icon with correct classes', () => {
    render(<ModelRecommendationsBadge />)
    const starIcon = screen.getByTestId('lucide-icon')
    expect(starIcon).toBeInTheDocument()
    expect(starIcon).toHaveClass('text-accent')
    expect(starIcon).toHaveClass('fill-accent')
  })
})
