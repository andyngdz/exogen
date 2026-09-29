import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ModelSearchViewDownloadButton } from '../ModelSearchViewDownloadButton'

const mockOnDownload = vi.fn()
const mockUseDownloadWatcher = vi.fn()
const mockUseDownloadButton = vi.fn()

vi.mock('@/features/download-watcher', () => ({
  useDownloadWatcher: (id: string) => mockUseDownloadWatcher(id)
}))

vi.mock('../../states', () => ({
  useDownloadButton: (id: string) => mockUseDownloadButton(id)
}))

describe('ModelSearchViewDownloadButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseDownloadButton.mockReturnValue({ onDownload: mockOnDownload })
  })

  describe('Rendering', () => {
    it('renders button with correct text when not downloading', () => {
      mockUseDownloadWatcher.mockReturnValue({ isDownloading: false })

      render(<ModelSearchViewDownloadButton id="test-model-123" />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Download this model')
      expect(button).toHaveClass('button--primary')
      expect(button).not.toHaveAttribute('data-pending')
    })

    it('renders button with correct text when downloading', () => {
      mockUseDownloadWatcher.mockReturnValue({ isDownloading: true })

      render(<ModelSearchViewDownloadButton id="test-model-123" />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Downloading')
      expect(button).toHaveAttribute('data-pending', 'true')
    })

    it('applies animate-pulse class to text when downloading', () => {
      mockUseDownloadWatcher.mockReturnValue({ isDownloading: true })

      render(<ModelSearchViewDownloadButton id="test-model-123" />)

      const textSpan = screen.getByText('Downloading')
      expect(textSpan).toHaveClass('animate-pulse')
    })

    it('does not apply animate-pulse class when not downloading', () => {
      mockUseDownloadWatcher.mockReturnValue({ isDownloading: false })

      render(<ModelSearchViewDownloadButton id="test-model-123" />)

      const textSpan = screen.getByText('Download this model')
      expect(textSpan).not.toHaveClass('animate-pulse')
    })
  })

  describe('User Interactions', () => {
    it('calls onDownload when button is clicked', async () => {
      mockUseDownloadWatcher.mockReturnValue({ isDownloading: false })
      const user = userEvent.setup()

      render(<ModelSearchViewDownloadButton id="test-model-123" />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockOnDownload).toHaveBeenCalledTimes(1)
    })

    it('ignores presses while downloading', async () => {
      mockUseDownloadWatcher.mockReturnValue({ isDownloading: true })
      const user = userEvent.setup()

      render(<ModelSearchViewDownloadButton id="test-model-123" />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockOnDownload).not.toHaveBeenCalled()
    })
  })

  describe('Hook Integration', () => {
    it('calls useDownloadWatcher with correct model id', () => {
      mockUseDownloadWatcher.mockReturnValue({ isDownloading: false })

      render(<ModelSearchViewDownloadButton id="model-456" />)

      expect(mockUseDownloadWatcher).toHaveBeenCalledWith('model-456')
    })

    it('calls useDownloadButton with correct model id', () => {
      mockUseDownloadWatcher.mockReturnValue({ isDownloading: false })

      render(<ModelSearchViewDownloadButton id="model-789" />)

      expect(mockUseDownloadButton).toHaveBeenCalledWith('model-789')
    })
  })
})
