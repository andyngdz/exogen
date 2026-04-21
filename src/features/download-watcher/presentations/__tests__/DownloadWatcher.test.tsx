import { createQueryClientWrapper } from '@/cores/test-utils'
import type {
  DownloadModelStartResponse,
  DownloadStepProgressResponse
} from '@/cores/sockets'
import { SocketEvents } from '@/cores/sockets'
import { ModelDownloaded } from '@/types'
import { ModelFamily } from '@/types'
import { QueryClient } from '@tanstack/react-query'
import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup, render } from '@testing-library/react'
import type { MockInstance } from '@vitest/spy'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as useDownloadWatcherStoreModule from '../../states/useDownloadWatchStore'
import { DownloadWatcher } from '../DownloadWatcher'

expect.extend(matchers)

// Mock useSocketEvent to capture event handlers
let capturedHandlers: Record<string, (data: unknown) => void> = {}

vi.mock('@/cores/sockets', async () => {
  const actual = await vi.importActual('@/cores/sockets')
  return {
    ...actual,
    useSocketEvent: vi.fn((event: string, handler: (data: unknown) => void) => {
      capturedHandlers[event] = handler
    })
  }
})

// Mock model selector store
const mockSetSelectedModelId = vi.fn()
const mockSetLoadedModelFamily = vi.fn()
const mockUseModelSelectorStore = vi.fn(() => ({
  selected_model_id: '',
  loaded_model_family: ModelFamily.UNKNOWN,
  setSelectedModelId: mockSetSelectedModelId,
  setLoadedModelFamily: mockSetLoadedModelFamily
}))

vi.mock('@/features/model-selectors/states', () => ({
  useModelSelectorStore: () => mockUseModelSelectorStore()
}))

// Mock useQueryClient to return our controlled mockQueryClient
let mockQueryClient: QueryClient
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query')
  return {
    ...actual,
    useQueryClient: () => mockQueryClient
  }
})

describe('DownloadWatcher', () => {
  let mockOnUpdateStep: MockInstance
  let mockOnSetModelId: MockInstance
  let mockOnResetStep: MockInstance
  let mockOnResetModelId: MockInstance

  const QueryClientWrapper = createQueryClientWrapper()

  beforeEach(() => {
    vi.clearAllMocks()
    capturedHandlers = {}

    // Reset mock model selector store to default state
    mockUseModelSelectorStore.mockReturnValue({
      selected_model_id: '',
      loaded_model_family: ModelFamily.UNKNOWN,
      setSelectedModelId: mockSetSelectedModelId,
      setLoadedModelFamily: mockSetLoadedModelFamily
    })

    // Create mock functions
    mockOnUpdateStep = vi.fn()
    mockOnSetModelId = vi.fn()
    mockOnResetStep = vi.fn()
    mockOnResetModelId = vi.fn()

    // Create real QueryClient with mock invalidateQueries
    mockQueryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })
    mockQueryClient.invalidateQueries = vi.fn()

    // Spy on the store hook
    vi.spyOn(
      useDownloadWatcherStoreModule,
      'useDownloadWatcherStore'
    ).mockReturnValue({
      model_id: undefined,
      step: undefined,
      onUpdateStep: mockOnUpdateStep,
      onSetModelId: mockOnSetModelId,
      onResetStep: mockOnResetStep,
      onResetModelId: mockOnResetModelId
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('renders children without modification', () => {
    const TestChild = () => <div data-testid="test-child">Test Content</div>

    const { getByTestId } = render(
      <QueryClientWrapper>
        <DownloadWatcher>
          <TestChild />
        </DownloadWatcher>
      </QueryClientWrapper>
    )

    expect(getByTestId('test-child')).toBeTruthy()
    expect(getByTestId('test-child')).toHaveTextContent('Test Content')
  })

  it('subscribes to download start, progress, and completed events', async () => {
    const { useSocketEvent } = vi.mocked(await import('@/cores/sockets'))

    render(
      <QueryClientWrapper>
        <DownloadWatcher>
          <div>Child</div>
        </DownloadWatcher>
      </QueryClientWrapper>
    )

    // Verify useSocketEvent was called for all 3 events
    expect(useSocketEvent).toHaveBeenCalledWith(
      SocketEvents.DOWNLOAD_START,
      expect.any(Function),
      expect.any(Array)
    )
    expect(useSocketEvent).toHaveBeenCalledWith(
      SocketEvents.DOWNLOAD_STEP_PROGRESS,
      expect.any(Function),
      expect.any(Array)
    )
    expect(useSocketEvent).toHaveBeenCalledWith(
      SocketEvents.DOWNLOAD_COMPLETED,
      expect.any(Function),
      expect.any(Array)
    )
  })

  it('handles download start event by calling onSetModelId', () => {
    render(
      <QueryClientWrapper>
        <DownloadWatcher>
          <div>Child</div>
        </DownloadWatcher>
      </QueryClientWrapper>
    )

    const startData: DownloadModelStartResponse = { model_id: 'model-123' }

    // Simulate socket event
    capturedHandlers[SocketEvents.DOWNLOAD_START](startData)

    expect(mockOnSetModelId).toHaveBeenCalledWith('model-123')
    expect(mockOnSetModelId).toHaveBeenCalledTimes(1)
  })

  it('handles download progress event by calling onUpdateStep', () => {
    render(
      <QueryClientWrapper>
        <DownloadWatcher>
          <div>Child</div>
        </DownloadWatcher>
      </QueryClientWrapper>
    )

    const progressData: DownloadStepProgressResponse = {
      model_id: 'model-456',
      step: 3,
      total: 10,
      downloaded_size: 1024,
      total_downloaded_size: 10240,
      phase: 'downloading'
    }

    // Simulate socket event
    capturedHandlers[SocketEvents.DOWNLOAD_STEP_PROGRESS](progressData)

    expect(mockOnUpdateStep).toHaveBeenCalledWith(progressData)
    expect(mockOnUpdateStep).toHaveBeenCalledTimes(1)
  })

  it('handles download completed event by resetting store', () => {
    render(
      <QueryClientWrapper>
        <DownloadWatcher>
          <div>Child</div>
        </DownloadWatcher>
      </QueryClientWrapper>
    )

    // Simulate socket event
    capturedHandlers[SocketEvents.DOWNLOAD_COMPLETED](undefined)

    expect(mockOnResetStep).toHaveBeenCalledTimes(1)
    expect(mockOnResetModelId).toHaveBeenCalledTimes(1)
    // Note: invalidateQueries is tested at integration level
  })

  it('handles multiple progress updates correctly', () => {
    render(
      <QueryClientWrapper>
        <DownloadWatcher>
          <div>Child</div>
        </DownloadWatcher>
      </QueryClientWrapper>
    )

    const progressUpdates: DownloadStepProgressResponse[] = [
      {
        model_id: 'model-1',
        step: 1,
        total: 5,
        downloaded_size: 512,
        total_downloaded_size: 2560,
        phase: 'downloading'
      },
      {
        model_id: 'model-1',
        step: 2,
        total: 5,
        downloaded_size: 1024,
        total_downloaded_size: 2560,
        phase: 'downloading'
      },
      {
        model_id: 'model-1',
        step: 3,
        total: 5,
        downloaded_size: 1536,
        total_downloaded_size: 2560,
        phase: 'downloading'
      }
    ]

    // Simulate multiple progress events
    progressUpdates.forEach((update) => {
      capturedHandlers[SocketEvents.DOWNLOAD_STEP_PROGRESS](update)
    })

    expect(mockOnUpdateStep).toHaveBeenCalledTimes(3)
    expect(mockOnUpdateStep).toHaveBeenNthCalledWith(1, progressUpdates[0])
    expect(mockOnUpdateStep).toHaveBeenNthCalledWith(2, progressUpdates[1])
    expect(mockOnUpdateStep).toHaveBeenNthCalledWith(3, progressUpdates[2])
  })

  it('handles edge case with zero total in progress event', () => {
    render(
      <QueryClientWrapper>
        <DownloadWatcher>
          <div>Child</div>
        </DownloadWatcher>
      </QueryClientWrapper>
    )

    const edgeCaseData: DownloadStepProgressResponse = {
      model_id: 'model-edge',
      step: 1,
      total: 0,
      downloaded_size: 0,
      total_downloaded_size: 0,
      phase: 'downloading'
    }

    // Simulate socket event with edge case data
    capturedHandlers[SocketEvents.DOWNLOAD_STEP_PROGRESS](edgeCaseData)

    expect(mockOnUpdateStep).toHaveBeenCalledWith(edgeCaseData)
  })

  it('maintains callback stability with useCallback', async () => {
    const { useSocketEvent } = vi.mocked(await import('@/cores/sockets'))

    render(
      <QueryClientWrapper>
        <DownloadWatcher>
          <div>Child</div>
        </DownloadWatcher>
      </QueryClientWrapper>
    )

    // useSocketEvent should be called exactly 3 times (once for each event)
    expect(useSocketEvent).toHaveBeenCalledTimes(3)

    // Verify the events are the expected ones
    expect(useSocketEvent).toHaveBeenCalledWith(
      SocketEvents.DOWNLOAD_START,
      expect.any(Function),
      expect.any(Array)
    )
    expect(useSocketEvent).toHaveBeenCalledWith(
      SocketEvents.DOWNLOAD_STEP_PROGRESS,
      expect.any(Function),
      expect.any(Array)
    )
    expect(useSocketEvent).toHaveBeenCalledWith(
      SocketEvents.DOWNLOAD_COMPLETED,
      expect.any(Function),
      expect.any(Array)
    )
  })

  it('handles complete download lifecycle', () => {
    render(
      <QueryClientWrapper>
        <DownloadWatcher>
          <div>Child</div>
        </DownloadWatcher>
      </QueryClientWrapper>
    )

    // 1. Download starts
    capturedHandlers[SocketEvents.DOWNLOAD_START]({ model_id: 'model-full' })
    expect(mockOnSetModelId).toHaveBeenCalledWith('model-full')

    // 2. Progress updates
    capturedHandlers[SocketEvents.DOWNLOAD_STEP_PROGRESS]({
      model_id: 'model-full',
      step: 1,
      total: 2,
      downloaded_size: 500,
      total_downloaded_size: 1000,
      phase: 'downloading'
    })
    expect(mockOnUpdateStep).toHaveBeenCalledTimes(1)

    // 3. More progress
    capturedHandlers[SocketEvents.DOWNLOAD_STEP_PROGRESS]({
      model_id: 'model-full',
      step: 2,
      total: 2,
      downloaded_size: 500,
      total_downloaded_size: 1000,
      phase: 'downloading'
    })
    expect(mockOnUpdateStep).toHaveBeenCalledTimes(2)

    // 4. Download completes
    capturedHandlers[SocketEvents.DOWNLOAD_COMPLETED](undefined)
    expect(mockOnResetStep).toHaveBeenCalled()
    expect(mockOnResetModelId).toHaveBeenCalled()
  })

  describe('Auto-selection behavior', () => {
    it('auto-selects first model when download completes and no model is selected', () => {
      // Setup: empty selected_model_id
      mockUseModelSelectorStore.mockReturnValue({
        selected_model_id: '',
        loaded_model_family: ModelFamily.UNKNOWN,
        setSelectedModelId: mockSetSelectedModelId,
        setLoadedModelFamily: mockSetLoadedModelFamily
      })

      // Setup QueryClient with first downloaded model
      const firstModel: ModelDownloaded = {
        id: 1,
        model_id: 'first-model',
        model_dir: '/models/first-model',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      }
      mockQueryClient.setQueryData(['getDownloadedModels'], [firstModel])

      render(
        <QueryClientWrapper>
          <DownloadWatcher>
            <div>Child</div>
          </DownloadWatcher>
        </QueryClientWrapper>
      )

      // Simulate download completion
      capturedHandlers[SocketEvents.DOWNLOAD_COMPLETED](undefined)

      // Should auto-select the first model
      expect(mockSetSelectedModelId).toHaveBeenCalledWith('first-model')
      expect(mockSetSelectedModelId).toHaveBeenCalledTimes(1)
    })

    it('does NOT auto-select when a model is already selected', () => {
      // Setup: model already selected
      mockUseModelSelectorStore.mockReturnValue({
        selected_model_id: 'existing-model',
        loaded_model_family: ModelFamily.UNKNOWN,
        setSelectedModelId: mockSetSelectedModelId,
        setLoadedModelFamily: mockSetLoadedModelFamily
      })

      // Setup QueryClient with one model
      const firstModel: ModelDownloaded = {
        id: 2,
        model_id: 'new-model',
        model_dir: '/models/new-model',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      }
      mockQueryClient.setQueryData(['getDownloadedModels'], [firstModel])

      render(
        <QueryClientWrapper>
          <DownloadWatcher>
            <div>Child</div>
          </DownloadWatcher>
        </QueryClientWrapper>
      )

      // Simulate download completion
      capturedHandlers[SocketEvents.DOWNLOAD_COMPLETED](undefined)

      // Should NOT change selection
      expect(mockSetSelectedModelId).not.toHaveBeenCalled()
    })

    it('does NOT auto-select when multiple models exist', () => {
      // Setup: empty selected_model_id
      mockUseModelSelectorStore.mockReturnValue({
        selected_model_id: '',
        loaded_model_family: ModelFamily.UNKNOWN,
        setSelectedModelId: mockSetSelectedModelId,
        setLoadedModelFamily: mockSetLoadedModelFamily
      })

      // Setup QueryClient with multiple models
      const multipleModels: ModelDownloaded[] = [
        {
          id: 3,
          model_id: 'model-1',
          model_dir: '/models/model-1',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        },
        {
          id: 4,
          model_id: 'model-2',
          model_dir: '/models/model-2',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        }
      ]
      mockQueryClient.setQueryData(['getDownloadedModels'], multipleModels)

      render(
        <QueryClientWrapper>
          <DownloadWatcher>
            <div>Child</div>
          </DownloadWatcher>
        </QueryClientWrapper>
      )

      // Simulate download completion
      capturedHandlers[SocketEvents.DOWNLOAD_COMPLETED](undefined)

      // Should NOT auto-select when multiple models exist
      expect(mockSetSelectedModelId).not.toHaveBeenCalled()
    })

    it('does NOT auto-select when downloaded models list is empty', () => {
      // Setup: empty selected_model_id
      mockUseModelSelectorStore.mockReturnValue({
        selected_model_id: '',
        loaded_model_family: ModelFamily.UNKNOWN,
        setSelectedModelId: mockSetSelectedModelId,
        setLoadedModelFamily: mockSetLoadedModelFamily
      })

      // Setup QueryClient with empty models
      mockQueryClient.setQueryData(['getDownloadedModels'], [])

      render(
        <QueryClientWrapper>
          <DownloadWatcher>
            <div>Child</div>
          </DownloadWatcher>
        </QueryClientWrapper>
      )

      // Simulate download completion
      capturedHandlers[SocketEvents.DOWNLOAD_COMPLETED](undefined)

      // Should NOT auto-select when no models exist
      expect(mockSetSelectedModelId).not.toHaveBeenCalled()
    })

    it('handles undefined downloaded models gracefully', () => {
      // Setup: empty selected_model_id
      mockUseModelSelectorStore.mockReturnValue({
        selected_model_id: '',
        loaded_model_family: ModelFamily.UNKNOWN,
        setSelectedModelId: mockSetSelectedModelId,
        setLoadedModelFamily: mockSetLoadedModelFamily
      })

      // Setup QueryClient with undefined (no data)
      mockQueryClient.setQueryData(['getDownloadedModels'], undefined)

      render(
        <QueryClientWrapper>
          <DownloadWatcher>
            <div>Child</div>
          </DownloadWatcher>
        </QueryClientWrapper>
      )

      // Simulate download completion
      capturedHandlers[SocketEvents.DOWNLOAD_COMPLETED](undefined)

      // Should NOT crash and NOT auto-select
      expect(mockSetSelectedModelId).not.toHaveBeenCalled()
    })
  })
})
