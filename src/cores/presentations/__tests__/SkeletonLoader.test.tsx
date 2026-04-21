import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SkeletonLoader } from '../skeleton-loader/presentations/SkeletonLoader'

interface MockData {
  message: string
}

describe('SkeletonLoader', () => {
  const mockSkeleton = <div data-testid="skeleton">Loading...</div>
  const mockData: MockData = { message: 'Actual Content' }

  it('shows skeleton when isLoading is true', () => {
    render(
      <SkeletonLoader isLoading={true} skeleton={mockSkeleton} data={mockData}>
        {(data) => <div data-testid="content">{data.message}</div>}
      </SkeletonLoader>
    )

    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    expect(screen.queryByTestId('content')).not.toBeInTheDocument()
  })

  it('shows content when isLoading is false and data is provided', () => {
    render(
      <SkeletonLoader isLoading={false} skeleton={mockSkeleton} data={mockData}>
        {(data) => <div data-testid="content">{data.message}</div>}
      </SkeletonLoader>
    )

    expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
    expect(screen.getByTestId('content')).toBeInTheDocument()
    expect(screen.getByText('Actual Content')).toBeInTheDocument()
  })

  it('shows nothing when isLoading is false but no data is provided', () => {
    const { container } = render(
      <SkeletonLoader
        isLoading={false}
        skeleton={mockSkeleton}
        data={undefined}
      >
        {(data: MockData) => <div data-testid="content">{data.message}</div>}
      </SkeletonLoader>
    )

    expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
    expect(screen.queryByTestId('content')).not.toBeInTheDocument()
    // AnimatePresence may leave a wrapper div
    expect(container.querySelector('[data-testid="skeleton"]')).toBeNull()
    expect(container.querySelector('[data-testid="content"]')).toBeNull()
  })

  it('renders skeleton with fade effect', () => {
    const { container } = render(
      <SkeletonLoader isLoading={true} skeleton={mockSkeleton} data={mockData}>
        {(data) => <div data-testid="content">{data.message}</div>}
      </SkeletonLoader>
    )

    // Check that the motion wrapper is present
    const motionDiv = container.querySelector(
      '[data-testid="skeleton"]'
    )?.parentElement
    expect(motionDiv).toBeInTheDocument()
  })

  it('renders content with fade effect', () => {
    const { container } = render(
      <SkeletonLoader isLoading={false} skeleton={mockSkeleton} data={mockData}>
        {(data) => <div data-testid="content">{data.message}</div>}
      </SkeletonLoader>
    )

    // Check that the motion wrapper is present
    const motionDiv = container.querySelector(
      '[data-testid="content"]'
    )?.parentElement
    expect(motionDiv).toBeInTheDocument()
  })
})
