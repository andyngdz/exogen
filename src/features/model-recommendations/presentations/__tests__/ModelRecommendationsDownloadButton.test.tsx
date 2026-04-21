import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ModelRecommendationsDownloadButton } from '../ModelRecommendationsDownloadButton'

// Mock the download watcher hooks
const mockUseDownloadWatcherStore = vi.fn()
const mockUseDownloadWatcher = vi.fn()
vi.mock('@/features/download-watcher', () => ({
  useDownloadWatcherStore: () => mockUseDownloadWatcherStore(),
  useDownloadWatcher: (modelId: string) => mockUseDownloadWatcher(modelId)
}))

// Mock the services
vi.mock('@/services', () => ({
  api: {
    downloadModel: vi.fn()
  },
  formatter: {
    bytes: vi.fn()
  }
}))

// Import the mocked services to access the mock functions
import { api, formatter } from '@/services'
const mockDownloadModel = vi.mocked(api.downloadModel)
const mockFormatBytes = vi.mocked(formatter.bytes)

// Mock HeroUI Button
vi.mock('@heroui/react', () => ({
  Button: ({
    children,
    onPress,
    isDisabled,
    color,
    variant,
    size,
    className,
    startContent
  }: {
    children: React.ReactNode
    onPress: () => void
    isDisabled?: boolean
    color?: string
    variant?: string
    size?: string
    className?: string
    startContent?: React.ReactNode
  }) => (
    <button
      onClick={onPress}
      disabled={isDisabled}
      data-testid="download-button"
      data-color={color}
      data-variant={variant}
      data-size={size}
      className={className}
    >
      {startContent}
      {children}
    </button>
  )
}))

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  ChevronDown: ({ size }: { size: number }) => (
    <div data-testid="chevron-down-icon" data-size={size}>
      ChevronDown Icon
    </div>
  )
}))

describe('ModelRecommendationsDownloadButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementations
    mockUseDownloadWatcherStore.mockReturnValue({
      model_id: undefined,
      onSetModelId: vi.fn()
    })

    mockUseDownloadWatcher.mockReturnValue({
      percent: 0,
      isDownloading: false,
      downloadSized: 0,
      downloadTotalSized: 0
    })

    mockFormatBytes.mockImplementation((bytes: number) => `${bytes} bytes`)
  })

  describe('Idle State (Not Downloading)', () => {
    it('renders download button with correct text', () => {
      render(<ModelRecommendationsDownloadButton modelId="test-model" />)

      expect(screen.getByText('Download Model')).toBeInTheDocument()
    })

    it('shows chevron down icon when not downloading', () => {
      render(<ModelRecommendationsDownloadButton modelId="test-model" />)

      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument()
    })

    it('applies default color and solid variant when not downloading', () => {
      render(<ModelRecommendationsDownloadButton modelId="test-model" />)

      const button = screen.getByTestId('download-button')
      expect(button).toHaveAttribute('data-color', 'default')
      expect(button).toHaveAttribute('data-variant', 'solid')
    })

    it('is not disabled when no model is downloading', () => {
      render(<ModelRecommendationsDownloadButton modelId="test-model" />)

      const button = screen.getByTestId('download-button')
      expect(button).not.toBeDisabled()
    })

    it('calls api.downloadModel when button is clicked', async () => {
      const user = userEvent.setup()
      mockDownloadModel.mockResolvedValue(undefined)

      render(<ModelRecommendationsDownloadButton modelId="test-model-123" />)

      const button = screen.getByTestId('download-button')
      await user.click(button)

      await waitFor(() => {
        expect(mockDownloadModel).toHaveBeenCalledWith('test-model-123')
      })
    })

    it('does not show progress bar when not downloading', () => {
      const { container } = render(
        <ModelRecommendationsDownloadButton modelId="test-model" />
      )

      const progressBar = container.querySelector('.bg-primary\\/30')
      expect(progressBar).not.toBeInTheDocument()
    })
  })

  describe('This Model Downloading', () => {
    beforeEach(() => {
      mockUseDownloadWatcherStore.mockReturnValue({
        model_id: 'test-model',
        onSetModelId: vi.fn()
      })

      mockUseDownloadWatcher.mockReturnValue({
        percent: 0.45,
        isDownloading: true,
        downloadSized: 4608, // 4.5 MB
        downloadTotalSized: 10240 // 10 MB
      })

      mockFormatBytes.mockImplementation((bytes: number) => {
        if (bytes === 4608) return '4.5 MB'
        if (bytes === 10240) return '10 MB'
        return `${bytes} bytes`
      })
    })

    it('shows downloading text with bytes', () => {
      render(<ModelRecommendationsDownloadButton modelId="test-model" />)

      expect(screen.getByText('4.5 MB / 10 MB')).toBeInTheDocument()
    })

    it('does not show chevron down icon when downloading', () => {
      render(<ModelRecommendationsDownloadButton modelId="test-model" />)

      expect(screen.queryByTestId('chevron-down-icon')).not.toBeInTheDocument()
    })

    it('applies primary color and bordered variant when downloading', () => {
      render(<ModelRecommendationsDownloadButton modelId="test-model" />)

      const button = screen.getByTestId('download-button')
      expect(button).toHaveAttribute('data-color', 'primary')
      expect(button).toHaveAttribute('data-variant', 'bordered')
    })

    it('is disabled when this model is downloading', () => {
      render(<ModelRecommendationsDownloadButton modelId="test-model" />)

      const button = screen.getByTestId('download-button')
      expect(button).toBeDisabled()
    })

    it('shows progress bar with correct width', () => {
      const { container } = render(
        <ModelRecommendationsDownloadButton modelId="test-model" />
      )

      const progressBar = container.querySelector(
        '.bg-primary\\/30'
      ) as HTMLElement
      expect(progressBar).toBeInTheDocument()
      expect(progressBar.style.width).toBe('45%')
    })

    it('applies animate-pulse class to text when downloading', () => {
      const { container } = render(
        <ModelRecommendationsDownloadButton modelId="test-model" />
      )

      const span = container.querySelector('.animate-pulse')
      expect(span).toBeInTheDocument()
    })

    it('applies text-foreground class when downloading', () => {
      const { container } = render(
        <ModelRecommendationsDownloadButton modelId="test-model" />
      )

      const span = container.querySelector('.text-foreground')
      expect(span).toBeInTheDocument()
    })
  })

  describe('Another Model Downloading', () => {
    beforeEach(() => {
      mockUseDownloadWatcherStore.mockReturnValue({
        model_id: 'other-model',
        onSetModelId: vi.fn()
      })

      mockUseDownloadWatcher.mockReturnValue({
        percent: 0,
        isDownloading: false,
        downloadSized: 0,
        downloadTotalSized: 0
      })
    })

    it('shows Download Model text (not downloading)', () => {
      render(<ModelRecommendationsDownloadButton modelId="test-model" />)

      expect(screen.getByText('Download Model')).toBeInTheDocument()
    })

    it('is disabled when another model is downloading', () => {
      render(<ModelRecommendationsDownloadButton modelId="test-model" />)

      const button = screen.getByTestId('download-button')
      expect(button).toBeDisabled()
    })

    it('does not show progress bar when another model is downloading', () => {
      const { container } = render(
        <ModelRecommendationsDownloadButton modelId="test-model" />
      )

      const progressBar = container.querySelector('.bg-primary\\/30')
      expect(progressBar).not.toBeInTheDocument()
    })

    it('shows chevron down icon when another model is downloading', () => {
      render(<ModelRecommendationsDownloadButton modelId="test-model" />)

      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument()
    })
  })

  describe('Progress Bar Widths', () => {
    it('shows 1% width at start', () => {
      mockUseDownloadWatcherStore.mockReturnValue({
        model_id: 'test-model',
        onSetModelId: vi.fn()
      })
      mockUseDownloadWatcher.mockReturnValue({
        percent: 0.01,
        isDownloading: true,
        downloadSized: 102,
        downloadTotalSized: 10240
      })

      const { container } = render(
        <ModelRecommendationsDownloadButton modelId="test-model" />
      )

      const progressBar = container.querySelector(
        '.bg-primary\\/30'
      ) as HTMLElement
      expect(progressBar.style.width).toBe('1%')
    })

    it('shows 50% width at halfway', () => {
      mockUseDownloadWatcherStore.mockReturnValue({
        model_id: 'test-model',
        onSetModelId: vi.fn()
      })
      mockUseDownloadWatcher.mockReturnValue({
        percent: 0.5,
        isDownloading: true,
        downloadSized: 5120,
        downloadTotalSized: 10240
      })

      const { container } = render(
        <ModelRecommendationsDownloadButton modelId="test-model" />
      )

      const progressBar = container.querySelector(
        '.bg-primary\\/30'
      ) as HTMLElement
      expect(progressBar.style.width).toBe('50%')
    })

    it('shows 100% width when complete', () => {
      mockUseDownloadWatcherStore.mockReturnValue({
        model_id: 'test-model',
        onSetModelId: vi.fn()
      })
      mockUseDownloadWatcher.mockReturnValue({
        percent: 1,
        isDownloading: true,
        downloadSized: 10240,
        downloadTotalSized: 10240
      })

      const { container } = render(
        <ModelRecommendationsDownloadButton modelId="test-model" />
      )

      const progressBar = container.querySelector(
        '.bg-primary\\/30'
      ) as HTMLElement
      expect(progressBar.style.width).toBe('100%')
    })
  })

  describe('Bytes Display', () => {
    it('displays formatted bytes correctly', () => {
      mockUseDownloadWatcherStore.mockReturnValue({
        model_id: 'test-model',
        onSetModelId: vi.fn()
      })
      mockUseDownloadWatcher.mockReturnValue({
        percent: 0.456,
        isDownloading: true,
        downloadSized: 4669,
        downloadTotalSized: 10240
      })
      mockFormatBytes.mockImplementation((bytes: number) => {
        if (bytes === 4669) return '4.6 MB'
        if (bytes === 10240) return '10 MB'
        return `${bytes} bytes`
      })

      render(<ModelRecommendationsDownloadButton modelId="test-model" />)

      expect(screen.getByText('4.6 MB / 10 MB')).toBeInTheDocument()
    })

    it('shows 0 bytes at start', () => {
      mockUseDownloadWatcherStore.mockReturnValue({
        model_id: 'test-model',
        onSetModelId: vi.fn()
      })
      mockUseDownloadWatcher.mockReturnValue({
        percent: 0.001,
        isDownloading: true,
        downloadSized: 10,
        downloadTotalSized: 10240
      })
      mockFormatBytes.mockImplementation((bytes: number) => {
        if (bytes === 10) return '10 B'
        if (bytes === 10240) return '10 MB'
        return `${bytes} bytes`
      })

      render(<ModelRecommendationsDownloadButton modelId="test-model" />)

      expect(screen.getByText('10 B / 10 MB')).toBeInTheDocument()
    })

    it('shows equal bytes when complete', () => {
      mockUseDownloadWatcherStore.mockReturnValue({
        model_id: 'test-model',
        onSetModelId: vi.fn()
      })
      mockUseDownloadWatcher.mockReturnValue({
        percent: 1,
        isDownloading: true,
        downloadSized: 10240,
        downloadTotalSized: 10240
      })
      mockFormatBytes.mockImplementation(() => '10 MB')

      render(<ModelRecommendationsDownloadButton modelId="test-model" />)

      expect(screen.getByText('10 MB / 10 MB')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('applies correct size', () => {
      render(<ModelRecommendationsDownloadButton modelId="test-model" />)

      const button = screen.getByTestId('download-button')
      expect(button).toHaveAttribute('data-size', 'sm')
    })

    it('applies w-full and z-10 classes to button', () => {
      render(<ModelRecommendationsDownloadButton modelId="test-model" />)

      const button = screen.getByTestId('download-button')
      expect(button).toHaveClass('w-full', 'relative', 'z-10')
    })

    it('applies font-semibold class to text', () => {
      const { container } = render(
        <ModelRecommendationsDownloadButton modelId="test-model" />
      )

      const span = container.querySelector('.font-semibold')
      expect(span).toBeInTheDocument()
    })

    it('applies transition classes to progress bar', () => {
      mockUseDownloadWatcherStore.mockReturnValue({
        model_id: 'test-model',
        onSetModelId: vi.fn()
      })
      mockUseDownloadWatcher.mockReturnValue({
        percent: 0.5,
        isDownloading: true,
        downloadSized: 5120,
        downloadTotalSized: 10240
      })

      const { container } = render(
        <ModelRecommendationsDownloadButton modelId="test-model" />
      )

      const progressBar = container.querySelector('.bg-primary\\/30')
      expect(progressBar).toHaveClass('transition-all', 'duration-300')
    })
  })
})
