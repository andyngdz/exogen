import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MaxMemoryScaleFactor } from '../MaxMemoryScaleFactor'

const mockRouter = {
  push: vi.fn(),
  back: vi.fn()
}

const mockMutation = {
  mutateAsync: vi.fn()
}

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter
}))

vi.mock('@/cores/api-queries', () => ({
  useMaxMemoryMutation: () => mockMutation
}))

vi.mock('@/features/setup-layout/presentations/SetupLayout', () => ({
  SetupLayout: ({
    children,
    onNext,
    title,
    description
  }: {
    children: React.ReactNode
    onNext?: VoidFunction
    title: string
    description: string
  }) => (
    <div data-testid="setup-layout">
      <h1>{title}</h1>
      <p>{description}</p>
      <div>{children}</div>
      <button data-testid="next-button" onClick={onNext}>
        Next
      </button>
    </div>
  )
}))

const mockHandlers = vi.hoisted(() => ({
  onGpuChange: vi.fn(),
  onRamChange: vi.fn()
}))

vi.mock('@/cores/presentations/memory-scale-factor', () => ({
  MemoryScaleFactorItems: ({
    onGpuChange,
    onRamChange,
    gpuScaleFactor,
    ramScaleFactor
  }: {
    onGpuChange: (value: number) => void
    onRamChange: (value: number) => void
    gpuScaleFactor: number
    ramScaleFactor: number
  }) => (
    <div data-testid="memory-scale-factor-items">
      Memory Items
      <div data-testid="gpu-value">{gpuScaleFactor}</div>
      <div data-testid="ram-value">{ramScaleFactor}</div>
      <button
        data-testid="mock-gpu"
        onClick={() => {
          mockHandlers.onGpuChange(0.7)
          onGpuChange(0.7)
        }}
      >
        gpu
      </button>
      <button
        data-testid="mock-ram"
        onClick={() => {
          mockHandlers.onRamChange(0.4)
          onRamChange(0.4)
        }}
      >
        ram
      </button>
    </div>
  ),
  MemoryScaleFactorPreview: () => (
    <div data-testid="memory-scale-factor-preview">Memory Preview</div>
  )
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockMutation.mutateAsync.mockResolvedValue(undefined)
})

describe('MaxMemoryScaleFactor', () => {
  it('renders all components correctly', () => {
    render(<MaxMemoryScaleFactor />)

    expect(screen.getByText('Max Memory')).toBeInTheDocument()
    expect(
      screen.getByText('Configure the maximum memory allocation for AI models')
    ).toBeInTheDocument()

    expect(screen.getByTestId('memory-scale-factor-items')).toBeInTheDocument()
    expect(
      screen.getByTestId('memory-scale-factor-preview')
    ).toBeInTheDocument()
  })

  it('calls mutation and navigates on form submission', async () => {
    const user = userEvent.setup()

    render(<MaxMemoryScaleFactor />)

    await user.click(screen.getByTestId('next-button'))

    await waitFor(() => {
      expect(mockMutation.mutateAsync).toHaveBeenCalledWith({
        gpuScaleFactor: 0.5,
        ramScaleFactor: 0.5
      })
    })

    expect(mockRouter.push).toHaveBeenCalledWith('/model-recommendations')
  })

  it('updates watched values before submit when sliders change', async () => {
    const user = userEvent.setup()
    render(<MaxMemoryScaleFactor />)

    await user.click(screen.getByTestId('mock-gpu'))
    await user.click(screen.getByTestId('mock-ram'))
    await user.click(screen.getByTestId('next-button'))

    await waitFor(() => {
      expect(mockMutation.mutateAsync).toHaveBeenCalledWith({
        gpuScaleFactor: 0.7,
        ramScaleFactor: 0.4
      })
    })

    expect(mockHandlers.onGpuChange).toHaveBeenCalledWith(0.7)
    expect(mockHandlers.onRamChange).toHaveBeenCalledWith(0.4)
  })
})
