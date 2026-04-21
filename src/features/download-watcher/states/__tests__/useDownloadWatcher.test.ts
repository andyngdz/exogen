import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDownloadWatcher } from '../useDownloadWatcher'
import * as useDownloadWatcherStoreModule from '../useDownloadWatchStore'

// Mock the store
vi.mock('../useDownloadWatchStore', () => ({
  useDownloadWatcherStore: vi.fn()
}))

describe('useDownloadWatcher', () => {
  const mockUseDownloadWatcherStore = vi.mocked(
    useDownloadWatcherStoreModule.useDownloadWatcherStore
  )

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock: no active download
    mockUseDownloadWatcherStore.mockReturnValue({
      model_id: undefined,
      step: undefined,
      onSetModelId: vi.fn(),
      onUpdateStep: vi.fn(),
      onResetStep: vi.fn(),
      onResetModelId: vi.fn()
    })
  })

  describe('isDownloading', () => {
    it('returns true when watchId matches store model_id', () => {
      mockUseDownloadWatcherStore.mockReturnValue({
        model_id: 'test-model',
        step: undefined,
        onSetModelId: vi.fn(),
        onUpdateStep: vi.fn(),
        onResetStep: vi.fn(),
        onResetModelId: vi.fn()
      })

      const { result } = renderHook(() => useDownloadWatcher('test-model'))

      expect(result.current.isDownloading).toBe(true)
    })

    it('returns false when watchId does not match store model_id', () => {
      mockUseDownloadWatcherStore.mockReturnValue({
        model_id: 'other-model',
        step: undefined,
        onSetModelId: vi.fn(),
        onUpdateStep: vi.fn(),
        onResetStep: vi.fn(),
        onResetModelId: vi.fn()
      })

      const { result } = renderHook(() => useDownloadWatcher('test-model'))

      expect(result.current.isDownloading).toBe(false)
    })

    it('returns false when store model_id is undefined', () => {
      const { result } = renderHook(() => useDownloadWatcher('test-model'))

      expect(result.current.isDownloading).toBe(false)
    })
  })

  describe('percent', () => {
    it('calculates percent correctly when step has valid data', () => {
      mockUseDownloadWatcherStore.mockReturnValue({
        model_id: 'test-model',
        step: {
          model_id: 'test-model',
          step: 5,
          total: 10,
          downloaded_size: 5242880, // 5 MB
          total_downloaded_size: 10485760, // 10 MB
          phase: 'downloading'
        },
        onSetModelId: vi.fn(),
        onUpdateStep: vi.fn(),
        onResetStep: vi.fn(),
        onResetModelId: vi.fn()
      })

      const { result } = renderHook(() => useDownloadWatcher('test-model'))

      expect(result.current.percent).toBe(0.5) // 5MB / 10MB = 0.5
    })

    it('returns 0 when step is undefined', () => {
      const { result } = renderHook(() => useDownloadWatcher('test-model'))

      expect(result.current.percent).toBe(0)
    })

    it('returns 0 when total_downloaded_size is 0', () => {
      mockUseDownloadWatcherStore.mockReturnValue({
        model_id: 'test-model',
        step: {
          model_id: 'test-model',
          step: 0,
          total: 10,
          downloaded_size: 0,
          total_downloaded_size: 0,
          phase: 'starting'
        },
        onSetModelId: vi.fn(),
        onUpdateStep: vi.fn(),
        onResetStep: vi.fn(),
        onResetModelId: vi.fn()
      })

      const { result } = renderHook(() => useDownloadWatcher('test-model'))

      expect(result.current.percent).toBe(0)
    })

    it('calculates percent for partial downloads', () => {
      mockUseDownloadWatcherStore.mockReturnValue({
        model_id: 'test-model',
        step: {
          model_id: 'test-model',
          step: 3,
          total: 10,
          downloaded_size: 3145728, // 3 MB
          total_downloaded_size: 10485760, // 10 MB
          phase: 'downloading'
        },
        onSetModelId: vi.fn(),
        onUpdateStep: vi.fn(),
        onResetStep: vi.fn(),
        onResetModelId: vi.fn()
      })

      const { result } = renderHook(() => useDownloadWatcher('test-model'))

      expect(result.current.percent).toBeCloseTo(0.3, 2) // ~30%
    })

    it('returns 1 when download is complete', () => {
      mockUseDownloadWatcherStore.mockReturnValue({
        model_id: 'test-model',
        step: {
          model_id: 'test-model',
          step: 10,
          total: 10,
          downloaded_size: 10485760, // 10 MB
          total_downloaded_size: 10485760, // 10 MB
          phase: 'complete'
        },
        onSetModelId: vi.fn(),
        onUpdateStep: vi.fn(),
        onResetStep: vi.fn(),
        onResetModelId: vi.fn()
      })

      const { result } = renderHook(() => useDownloadWatcher('test-model'))

      expect(result.current.percent).toBe(1)
    })
  })

  describe('downloadSized', () => {
    it('returns downloaded_size when step is defined', () => {
      mockUseDownloadWatcherStore.mockReturnValue({
        model_id: 'test-model',
        step: {
          model_id: 'test-model',
          step: 3,
          total: 10,
          downloaded_size: 3145728,
          total_downloaded_size: 10485760,
          phase: 'downloading'
        },
        onSetModelId: vi.fn(),
        onUpdateStep: vi.fn(),
        onResetStep: vi.fn(),
        onResetModelId: vi.fn()
      })

      const { result } = renderHook(() => useDownloadWatcher('test-model'))

      expect(result.current.downloadSized).toBe(3145728)
    })

    it('returns 0 when step is undefined', () => {
      const { result } = renderHook(() => useDownloadWatcher('test-model'))

      expect(result.current.downloadSized).toBe(0)
    })
  })

  describe('downloadTotalSized', () => {
    it('returns total_downloaded_size when step is defined', () => {
      mockUseDownloadWatcherStore.mockReturnValue({
        model_id: 'test-model',
        step: {
          model_id: 'test-model',
          step: 3,
          total: 10,
          downloaded_size: 3145728,
          total_downloaded_size: 10485760,
          phase: 'downloading'
        },
        onSetModelId: vi.fn(),
        onUpdateStep: vi.fn(),
        onResetStep: vi.fn(),
        onResetModelId: vi.fn()
      })

      const { result } = renderHook(() => useDownloadWatcher('test-model'))

      expect(result.current.downloadTotalSized).toBe(10485760)
    })

    it('returns 0 when step is undefined', () => {
      const { result } = renderHook(() => useDownloadWatcher('test-model'))

      expect(result.current.downloadTotalSized).toBe(0)
    })
  })

  describe('currentFile', () => {
    it('returns current_file when step is defined and has current_file', () => {
      mockUseDownloadWatcherStore.mockReturnValue({
        model_id: 'test-model',
        step: {
          model_id: 'test-model',
          step: 3,
          total: 10,
          downloaded_size: 3145728,
          total_downloaded_size: 10485760,
          phase: 'downloading',
          current_file: 'model.safetensors'
        },
        onSetModelId: vi.fn(),
        onUpdateStep: vi.fn(),
        onResetStep: vi.fn(),
        onResetModelId: vi.fn()
      })

      const { result } = renderHook(() => useDownloadWatcher('test-model'))

      expect(result.current.currentFile).toBe('model.safetensors')
    })

    it('returns N/A when step is undefined', () => {
      const { result } = renderHook(() => useDownloadWatcher('test-model'))

      expect(result.current.currentFile).toBe('N/A')
    })

    it('returns undefined when current_file is not provided', () => {
      mockUseDownloadWatcherStore.mockReturnValue({
        model_id: 'test-model',
        step: {
          model_id: 'test-model',
          step: 3,
          total: 10,
          downloaded_size: 3145728,
          total_downloaded_size: 10485760,
          phase: 'downloading'
        },
        onSetModelId: vi.fn(),
        onUpdateStep: vi.fn(),
        onResetStep: vi.fn(),
        onResetModelId: vi.fn()
      })

      const { result } = renderHook(() => useDownloadWatcher('test-model'))

      expect(result.current.currentFile).toBeUndefined()
    })
  })

  describe('step', () => {
    it('returns the step object from store', () => {
      const mockStep = {
        model_id: 'test-model',
        step: 7,
        total: 10,
        downloaded_size: 7340032,
        total_downloaded_size: 10485760,
        phase: 'downloading',
        current_file: 'config.json'
      }

      mockUseDownloadWatcherStore.mockReturnValue({
        model_id: 'test-model',
        step: mockStep,
        onSetModelId: vi.fn(),
        onUpdateStep: vi.fn(),
        onResetStep: vi.fn(),
        onResetModelId: vi.fn()
      })

      const { result } = renderHook(() => useDownloadWatcher('test-model'))

      expect(result.current.step).toEqual(mockStep)
    })

    it('returns undefined when no step in store', () => {
      const { result } = renderHook(() => useDownloadWatcher('test-model'))

      expect(result.current.step).toBeUndefined()
    })
  })

  describe('integration', () => {
    it('provides all expected properties', () => {
      mockUseDownloadWatcherStore.mockReturnValue({
        model_id: 'test-model',
        step: {
          model_id: 'test-model',
          step: 5,
          total: 10,
          downloaded_size: 5242880,
          total_downloaded_size: 10485760,
          phase: 'downloading',
          current_file: 'model.bin'
        },
        onSetModelId: vi.fn(),
        onUpdateStep: vi.fn(),
        onResetStep: vi.fn(),
        onResetModelId: vi.fn()
      })

      const { result } = renderHook(() => useDownloadWatcher('test-model'))

      expect(result.current).toHaveProperty('isDownloading')
      expect(result.current).toHaveProperty('step')
      expect(result.current).toHaveProperty('percent')
      expect(result.current).toHaveProperty('downloadSized')
      expect(result.current).toHaveProperty('downloadTotalSized')
      expect(result.current).toHaveProperty('currentFile')
    })

    it('works correctly for a complete download lifecycle', () => {
      // Start: no download
      const { result, rerender } = renderHook(() =>
        useDownloadWatcher('test-model')
      )

      expect(result.current.isDownloading).toBe(false)
      expect(result.current.percent).toBe(0)
      expect(result.current.downloadSized).toBe(0)

      // Download starts
      mockUseDownloadWatcherStore.mockReturnValue({
        model_id: 'test-model',
        step: {
          model_id: 'test-model',
          step: 1,
          total: 10,
          downloaded_size: 1048576,
          total_downloaded_size: 10485760,
          phase: 'downloading',
          current_file: 'model.safetensors'
        },
        onSetModelId: vi.fn(),
        onUpdateStep: vi.fn(),
        onResetStep: vi.fn(),
        onResetModelId: vi.fn()
      })

      rerender()

      expect(result.current.isDownloading).toBe(true)
      expect(result.current.percent).toBeCloseTo(0.1, 2)
      expect(result.current.downloadSized).toBe(1048576)
      expect(result.current.currentFile).toBe('model.safetensors')

      // Download completes
      mockUseDownloadWatcherStore.mockReturnValue({
        model_id: 'test-model',
        step: {
          model_id: 'test-model',
          step: 10,
          total: 10,
          downloaded_size: 10485760,
          total_downloaded_size: 10485760,
          phase: 'complete',
          current_file: 'model.safetensors'
        },
        onSetModelId: vi.fn(),
        onUpdateStep: vi.fn(),
        onResetStep: vi.fn(),
        onResetModelId: vi.fn()
      })

      rerender()

      expect(result.current.isDownloading).toBe(true)
      expect(result.current.percent).toBe(1)
      expect(result.current.downloadSized).toBe(10485760)
      expect(result.current.downloadTotalSized).toBe(10485760)
    })
  })
})
