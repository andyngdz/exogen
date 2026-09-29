import { render, screen } from '@testing-library/react'
import { BackendStatusLevel } from '@types'
import { describe, expect, it } from 'vitest'
import { HealthCheckContent } from '../HealthCheckContent'

const makeStatus = (
  overrides: Partial<{
    id: string
    level: BackendStatusLevel
    message: string
    timestamp: number
  }> = {}
) => ({
  id: 'test-id',
  level: BackendStatusLevel.Info,
  message: 'Default status message',
  timestamp: 1,
  ...overrides
})

describe('HealthCheckContent', () => {
  it('renders success message when isHealthy is true', () => {
    render(
      <HealthCheckContent
        isHealthy={true}
        statuses={[makeStatus({ message: 'Backend ready' })]}
      />
    )

    expect(screen.getByText('Backend is running')).toBeInTheDocument()

    const chip = screen.getByText('Backend is running').closest('.chip')
    expect(chip).toHaveClass('chip--success')
  })

  it('renders error message when isHealthy is false', () => {
    render(
      <HealthCheckContent
        isHealthy={false}
        statuses={[
          makeStatus({
            level: BackendStatusLevel.Error,
            message: 'uv installation failed',
            timestamp: 2
          })
        ]}
      />
    )

    const statusElements = screen.getAllByText('uv installation failed')
    expect(statusElements.length).toBeGreaterThan(0)

    const chip = statusElements[0].closest('.chip')
    expect(chip).toHaveClass('chip--danger')
  })

  it('has proper layout with flex justify-center', () => {
    const { container } = render(
      <HealthCheckContent isHealthy={true} statuses={[makeStatus()]} />
    )

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('flex')
    expect(mainDiv).toHaveClass('flex-col')
  })
})
