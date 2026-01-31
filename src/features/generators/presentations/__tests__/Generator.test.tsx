import { ModelLoadPhase } from '@/cores/sockets'
import { GeneratorConfigFormValues } from '@/features/generator-configs'
import { act, render, screen } from '@testing-library/react'
import { UseFormReturn } from 'react-hook-form'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useGeneratorForm } from '../../states'
import { Generator } from '../Generator'
import { useMountedState } from 'react-use'

vi.mock('@/features/generator-configs', () => ({
  GeneratorConfig: () => (
    <div data-testid="generator-config">GeneratorConfig</div>
  )
}))

vi.mock('@/features/generator-modes', () => ({
  ModeTabs: () => <div data-testid="mode-tabs">ModeTabs</div>
}))

vi.mock('@/features/histories', () => ({
  Histories: () => <div data-testid="histories">Histories</div>
}))

// Mock Allotment component
vi.mock('allotment', () => {
  const AllotmentPane = ({
    children,
    className,
    maxSize,
    minSize,
    preferredSize
  }: {
    children: React.ReactNode
    className?: string
    maxSize?: number
    minSize?: number
    preferredSize?: number
  }) => (
    <div
      data-testid="allotment-pane"
      className={className}
      data-max-size={maxSize}
      data-min-size={minSize}
      data-preferred-size={preferredSize}
    >
      {children}
    </div>
  )

  const AllotmentComponent = Object.assign(
    ({
      children,
      defaultSizes
    }: {
      children: React.ReactNode
      defaultSizes: number[]
    }) => (
      <div
        data-testid="allotment"
        data-default-sizes={JSON.stringify(defaultSizes)}
      >
        {children}
      </div>
    ),
    { Pane: AllotmentPane }
  )

  return {
    Allotment: AllotmentComponent,
    __esModule: true
  }
})

// Mock FullScreenLoader to avoid loading lottie/assets
vi.mock('@/cores/presentations', () => ({
  FullScreenLoader: ({ message }: { message: string }) => (
    <div data-testid="fullscreen-loader">{message}</div>
  )
}))

// Mock the state hooks
const mockMethods: Partial<UseFormReturn<GeneratorConfigFormValues>> = {
  watch: vi.fn(),
  handleSubmit: vi.fn(),
  getValues: vi.fn(),
  getFieldState: vi.fn(),
  setError: vi.fn(),
  clearErrors: vi.fn(),
  setValue: vi.fn(),
  trigger: vi.fn(),
  formState: {} as UseFormReturn<GeneratorConfigFormValues>['formState'],
  resetField: vi.fn(),
  reset: vi.fn(),
  setFocus: vi.fn(),
  unregister: vi.fn(),
  control: {} as UseFormReturn<GeneratorConfigFormValues>['control'],
  register: vi.fn(),
  subscribe: vi.fn()
}

vi.mock('../../states', () => ({
  useGeneratorForm: vi.fn()
}))

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  FormProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="form-provider">{children}</div>
  )
}))

// Mock HeroUI Progress component
vi.mock('@heroui/react', () => ({
  Progress: ({
    isIndeterminate,
    size,
    'aria-label': ariaLabel
  }: {
    isIndeterminate?: boolean
    size?: string
    'aria-label'?: string
  }) => (
    <div
      data-testid="progress-indicator"
      data-indeterminate={isIndeterminate}
      data-size={size}
      aria-label={ariaLabel}
    />
  )
}))

// Mock react-use to make useMountedState return true (mounted)
vi.mock('react-use', () => ({
  useMountedState: vi.fn()
}))

describe('Generator', () => {
  beforeEach(() => {
    vi.mocked(useGeneratorForm).mockReturnValue({
      methods: mockMethods as UseFormReturn<GeneratorConfigFormValues>
    })

    vi.mocked(useMountedState).mockReturnValue(() => true)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders all main components', () => {
    render(<Generator />)

    expect(screen.getByTestId('generator-config')).toBeInTheDocument()
    expect(screen.getByTestId('mode-tabs')).toBeInTheDocument()
    expect(screen.getByTestId('histories')).toBeInTheDocument()
  })

  it('uses useGeneratorForm hook', () => {
    render(<Generator />)

    expect(useGeneratorForm).toHaveBeenCalled()
  })

  it('renders form with correct attributes', () => {
    render(<Generator />)

    const form = screen.getByRole('form')
    expect(form).toHaveAttribute('name', 'generator')
  })

  it('renders Allotment with correct default sizes', () => {
    render(<Generator />)

    const allotment = screen.getByTestId('allotment')
    expect(allotment).toHaveAttribute(
      'data-default-sizes',
      JSON.stringify([300, 0, 300])
    )
  })

  it('renders three Allotment panes with correct configurations', () => {
    render(<Generator />)

    const panes = screen.getAllByTestId('allotment-pane')
    expect(panes).toHaveLength(3)

    // First pane (GeneratorConfig)
    expect(panes[0]).toHaveAttribute('data-max-size', '350')
    expect(panes[0]).toHaveAttribute('data-min-size', '300')
    expect(panes[0]).toHaveAttribute('data-preferred-size', '300')

    // Third pane (histories)
    expect(panes[2]).toHaveAttribute('data-max-size', '350')
    expect(panes[2]).toHaveAttribute('data-min-size', '300')
    expect(panes[2]).toHaveAttribute('data-preferred-size', '300')
  })

  it('renders with proper layout structure', () => {
    render(<Generator />)

    // Should have the main form container
    const form = screen.getByRole('form')
    expect(form).toBeInTheDocument()

    // Should have all the required panes
    const panes = screen.getAllByTestId('allotment-pane')
    expect(panes).toHaveLength(3)
  })

  it('renders form with correct CSS classes', () => {
    render(<Generator />)

    const form = screen.getByRole('form')
    expect(form).toHaveClass(
      'w-full',
      'h-full',
      'transition-opacity',
      'opacity-100'
    )
  })

  it('renders the form when mounted', () => {
    render(<Generator />)

    // Form should be visible immediately (because useMountedState returns true)
    const form = screen.getByRole('form')
    expect(form).toBeInTheDocument()

    // Progress indicator should not be visible
    expect(screen.queryByTestId('progress-indicator')).not.toBeInTheDocument()
  })

  it('renders a progress indicator when not mounted yet', () => {
    vi.mocked(useMountedState).mockReturnValue(() => false)

    render(<Generator />)

    expect(screen.getByTestId('progress-indicator')).toBeInTheDocument()
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
  })

  it('shows fullscreen loader when model is loading', async () => {
    const { useModelLoadProgressStore } =
      await import('@/features/model-load-progress/states/useModelLoadProgressStore')

    // Simulate loading state wrapped in act
    act(() => {
      useModelLoadProgressStore.setState({
        model_id: 'model-123',
        progress: {
          model_id: 'model-123',
          step: 1,
          total: 2,
          message: 'Loading...',
          phase: ModelLoadPhase.INITIALIZATION
        }
      })
    })

    render(<Generator />)

    // Loader overlay should be present
    expect(screen.getByTestId('fullscreen-loader')).toHaveTextContent(
      'Loading...'
    )

    // Cleanup loading state
    act(() => {
      useModelLoadProgressStore.getState().reset()
    })
  })
})
