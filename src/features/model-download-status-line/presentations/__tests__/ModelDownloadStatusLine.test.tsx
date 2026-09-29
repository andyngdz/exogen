import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ModelDownloadStatusLine } from '../ModelDownloadStatusLine'

// Mock the useDownloadWatcher hook
const mockUseDownloadWatcher = vi.fn()
vi.mock('@/features/download-watcher', () => ({
  useDownloadWatcher: (id: string) => mockUseDownloadWatcher(id)
}))

const mockDownload = (percent: number) => {
  mockUseDownloadWatcher.mockReturnValue({
    percent,
    downloadSized: 0,
    downloadTotalSized: 0,
    currentFile: ''
  })
}

describe('ModelDownloadStatusLine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders separator always', () => {
    mockDownload(0)

    render(<ModelDownloadStatusLine id="test-model" />)

    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('calls useDownloadWatcher with correct id', () => {
    mockDownload(0)

    render(<ModelDownloadStatusLine id="test-model-123" />)

    expect(mockUseDownloadWatcher).toHaveBeenCalledWith('test-model-123')
  })

  it('does not show indicator when percent is 0', () => {
    mockDownload(0)

    render(<ModelDownloadStatusLine id="test-model" />)

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('does not show indicator when percent is negative', () => {
    mockDownload(-0.1)

    render(<ModelDownloadStatusLine id="test-model" />)

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it.each([
    [0.5, '50'],
    [0.75, '75'],
    [1, '100']
  ])('reports %s of the download as %s percent', (percent, valueNow) => {
    mockDownload(percent)

    render(<ModelDownloadStatusLine id="test-model" />)

    expect(
      screen.getByRole('progressbar', { name: 'Download progress' })
    ).toHaveAttribute('aria-valuenow', valueNow)
  })
})
