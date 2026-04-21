import { renderWithAct } from '@/cores/test-utils'
import { screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HealthCheck } from '../HealthCheck'
import * as useHealthCheckModule from '../../states/useHealthCheck'

// Mock the modules
vi.mock('../states/useBackendSetupStatus', () => ({
  useBackendSetupStatus: () => ({ entries: [] })
}))

vi.mock('../../states/useHealthCheck', () => ({
  useHealthCheck: vi.fn()
}))

vi.mock('@/features/setup-layout/presentations/SetupLayout', () => ({
  SetupLayout: ({
    children,
    title,
    description,
    onNext,
    isNextDisabled
  }: {
    children: React.ReactNode
    title: string
    description: string
    onNext?: () => void
    isNextDisabled?: boolean
  }) => (
    <div data-testid="mock-setup-layout">
      <h1>{title}</h1>
      <p>{description}</p>
      <div>{children}</div>
      <button
        data-testid="next-button"
        onClick={onNext}
        disabled={isNextDisabled}
      >
        Next
      </button>
    </div>
  )
}))

vi.mock('../HealthCheckContent', () => ({
  HealthCheckContent: ({
    isHealthy,
    statuses
  }: {
    isHealthy: boolean
    statuses: unknown[]
  }) => (
    <div data-testid="mock-health-check-content">
      {isHealthy ? 'Healthy' : 'Not Healthy'}
      <span data-testid="status-count">{statuses.length}</span>
    </div>
  )
}))

describe('HealthCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper to setup useHealthCheck mock
  const setupHealthCheckMock = (isHealthy: boolean) => {
    vi.mocked(useHealthCheckModule.useHealthCheck).mockReturnValue({
      isHealthy
    })
  }

  it('renders with correct title and description', async () => {
    setupHealthCheckMock(true)

    await renderWithAct(<HealthCheck />)

    expect(screen.getByText('Health Check')).toBeInTheDocument()
    expect(
      screen.getByText('Checking the connection to your ExoGen backend server')
    ).toBeInTheDocument()
  })

  it('renders HealthCheckContent with isHealthy=true when backend is healthy', async () => {
    setupHealthCheckMock(true)

    await renderWithAct(<HealthCheck />)

    const content = screen.getByTestId('mock-health-check-content')
    expect(content).toHaveTextContent('Healthy')
  })

  it('renders HealthCheckContent with isHealthy=false when backend is not healthy', async () => {
    setupHealthCheckMock(false)

    await renderWithAct(<HealthCheck />)

    const content = screen.getByTestId('mock-health-check-content')
    expect(content).toHaveTextContent('Not Healthy')
  })

  it('enables the Next button when backend is healthy', async () => {
    setupHealthCheckMock(true)

    await renderWithAct(<HealthCheck />)

    const nextButton = screen.getByTestId('next-button')
    expect(nextButton).not.toBeDisabled()
  })

  it('disables the Next button when backend is not healthy', async () => {
    setupHealthCheckMock(false)

    await renderWithAct(<HealthCheck />)

    const nextButton = screen.getByTestId('next-button')
    expect(nextButton).toBeDisabled()
  })
})
