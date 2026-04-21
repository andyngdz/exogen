import { createQueryClientWrapper } from '@/cores/test-utils'
import { useDownloadWatcherStore } from '@/features/download-watcher'
import type { UseDownloadWatcherStore } from '@/features/download-watcher'
import {
  ModelRecommendationResponse,
  ModelRecommendationSection
} from '@/types/api'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ModelRecommendations } from '../ModelRecommendations'

// Mock the dependencies
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: vi.fn(),
    replace: vi.fn()
  })
}))

// Mock the ModelRecommendationsList component
vi.mock('../ModelRecommendationsList', () => ({
  ModelRecommendationsList: ({
    sections,
    defaultSection
  }: {
    sections: ModelRecommendationSection[]
    defaultSection: string
  }) => (
    <div
      data-testid="mock-recommendations-list"
      data-sections-length={sections.length}
      data-default-section={defaultSection}
    >
      Model Recommendations List
    </div>
  )
}))

// Mock the SetupLayout component
vi.mock('@/features/setup-layout/presentations/SetupLayout', () => ({
  SetupLayout: ({
    title,
    description,
    onNext,
    onBack,
    isNextDisabled,
    isBackDisabled,
    children
  }: {
    title: string
    description: string
    onNext: () => void
    onBack: () => void
    isNextDisabled: boolean
    isBackDisabled: boolean
    children: React.ReactNode
  }) => (
    <div
      data-testid="mock-setup-layout"
      data-title={title}
      data-description={description}
      data-is-next-disabled={isNextDisabled ? 'true' : 'false'}
      data-is-back-disabled={isBackDisabled ? 'true' : 'false'}
    >
      <button data-testid="mock-next-button" onClick={onNext}>
        Next
      </button>
      <button data-testid="mock-back-button" onClick={onBack}>
        Back
      </button>
      <div data-testid="mock-layout-content">{children}</div>
    </div>
  )
}))

// Mock the useModelRecommendation hook
const mockOnNext = vi.fn()
const mockOnSkip = vi.fn()

// Create a mock function that we can access in our tests
const mockUseModelRecommendation = vi.fn()

// Mock the modules
vi.mock('../states/useModelRecommendation', () => ({
  useModelRecommendation: mockUseModelRecommendation
}))

// Mock the download watcher store
vi.mock('@/features/download-watcher', () => ({
  useDownloadWatcherStore: vi.fn()
}))

// Mock React Query
vi.mock('@/services/queries', () => ({
  useModelRecommendationsQuery: vi.fn().mockReturnValue({
    data: null,
    isLoading: false,
    error: null
  })
}))

// Mock HeroUI Button
vi.mock('@heroui/react', () => ({
  Button: ({
    children,
    onPress,
    ...props
  }: {
    children: React.ReactNode
    onPress: VoidFunction
  }) => (
    <button onClick={onPress} {...props}>
      {children}
    </button>
  )
}))

describe('ModelRecommendations', () => {
  // Mock data that will be returned by useModelRecommendation
  const mockData: ModelRecommendationResponse = {
    sections: [
      {
        id: 'section1',
        name: 'Section 1',
        description: 'Description 1',
        models: [],
        is_recommended: false
      },
      {
        id: 'section2',
        name: 'Section 2',
        description: 'Description 2',
        models: [],
        is_recommended: true
      }
    ],
    default_section: 'section2',
    default_selected_id: 'model1'
  }

  let downloadWatcherState: UseDownloadWatcherStore

  const setDownloadWatcherState = (downloadingId: string | null) => {
    downloadWatcherState = {
      model_id: downloadingId ?? undefined,
      step: undefined,
      onUpdateStep: vi.fn(),
      onSetModelId: vi.fn(),
      onResetStep: vi.fn(),
      onResetModelId: vi.fn()
    }

    vi.mocked(useDownloadWatcherStore).mockImplementation(((
      selector?: (state: UseDownloadWatcherStore) => unknown
    ) => {
      return selector ? selector(downloadWatcherState) : downloadWatcherState
    }) as typeof useDownloadWatcherStore)
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Set up the mock return value
    mockUseModelRecommendation.mockReturnValue({
      onNext: mockOnNext,
      onSkip: mockOnSkip,
      data: mockData
    })

    setDownloadWatcherState(null)
  })

  it('renders SetupLayout with correct props', () => {
    render(<ModelRecommendations />, { wrapper: createQueryClientWrapper() })

    const setupLayout = screen.getByTestId('mock-setup-layout')
    expect(setupLayout).toBeInTheDocument()
    expect(setupLayout).toHaveAttribute('data-title', 'Model Recommendations')
    expect(setupLayout).toHaveAttribute(
      'data-description',
      'Choose an AI model that fits your hardware capabilities and performance needs'
    )
    expect(setupLayout).toHaveAttribute('data-is-next-disabled', 'false')
    expect(setupLayout).toHaveAttribute('data-is-back-disabled', 'false')
  })

  it('renders without crashing when data is available', () => {
    mockUseModelRecommendation.mockReturnValueOnce({
      onNext: mockOnNext,
      onSkip: mockOnSkip,
      data: mockData
    })

    const { container } = render(<ModelRecommendations />, {
      wrapper: createQueryClientWrapper()
    })

    expect(container).toBeInTheDocument()
  })

  it('does not render ModelRecommendationsList when data is not available', () => {
    mockUseModelRecommendation.mockReturnValue({
      onNext: mockOnNext,
      onSkip: mockOnSkip,
      data: null
    })

    render(<ModelRecommendations />, { wrapper: createQueryClientWrapper() })

    expect(
      screen.queryByTestId('mock-recommendations-list')
    ).not.toBeInTheDocument()
  })

  it('passes onNext handler to SetupLayout', () => {
    render(<ModelRecommendations />, { wrapper: createQueryClientWrapper() })

    expect(screen.getByTestId('mock-next-button')).toBeInTheDocument()
  })

  it('disables navigation while a model is downloading', () => {
    setDownloadWatcherState('downloading-model')

    render(<ModelRecommendations />, { wrapper: createQueryClientWrapper() })

    const setupLayout = screen.getByTestId('mock-setup-layout')
    expect(setupLayout).toHaveAttribute('data-is-next-disabled', 'true')
    expect(setupLayout).toHaveAttribute('data-is-back-disabled', 'true')
  })

  it('enables navigation when no model is downloading', () => {
    setDownloadWatcherState(null)

    render(<ModelRecommendations />, { wrapper: createQueryClientWrapper() })

    const setupLayout = screen.getByTestId('mock-setup-layout')
    expect(setupLayout).toHaveAttribute('data-is-next-disabled', 'false')
    expect(setupLayout).toHaveAttribute('data-is-back-disabled', 'false')
  })

  it('renders skip button when not downloading', () => {
    setDownloadWatcherState(null)

    render(<ModelRecommendations />, { wrapper: createQueryClientWrapper() })

    const skipButton = screen.getByRole('button', { name: /skip for now/i })
    expect(skipButton).toBeInTheDocument()
    expect(skipButton).toHaveTextContent('Skip for now, I will download later')
  })

  it('does not render skip button when downloading', () => {
    setDownloadWatcherState('downloading-model')

    render(<ModelRecommendations />, { wrapper: createQueryClientWrapper() })

    expect(
      screen.queryByRole('button', { name: /skip for now/i })
    ).not.toBeInTheDocument()
  })
})
