import { createQueryClientWrapper } from '@/cores/test-utils'
import { ModelDetailsResponse } from '@/types'
import { render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Define the mock model ID
const mockModelId = 'test-model-123'

// Mock data that will be used in the tests
const mockModelDetailsData: ModelDetailsResponse = {
  id: 'test-model-123',
  author: 'test-author',
  downloads: 5000,
  likes: 1000,
  tags: ['tag1', 'tag2'],
  created_at: '2023-01-01T00:00:00.000Z',
  disabled: false,
  gated: 'false',
  last_modified: '2023-01-02T00:00:00.000Z',
  library_name: 'test-library',
  pipeline_tag: ['test'],
  private: false,
  sha: 'abc123',
  spaces: ['space-1', 'space-2'],
  siblings: [
    { blob_id: 'blob-1', rfilename: 'file1.bin', size: 1000 },
    { blob_id: 'blob-2', rfilename: 'file2.bin', size: 2000 }
  ]
}

// Create spy functions to track hook calls and control returned values
const useModelSearchViewMock = vi.fn()
const useModelSearchSelectorStoreMock = vi
  .fn()
  .mockReturnValue({ model_id: mockModelId })

// Create mocks with vi.mock
vi.mock('../../states', () => ({
  useModelSearchSelectorStore: () => useModelSearchSelectorStoreMock()
}))

// Mock useModelSearchView to track calls and return controlled data
vi.mock('../../states/useModelSearchView', () => ({
  useModelSearchView: (id: string) => useModelSearchViewMock(id)
}))

// Mock ScrollShadow to a simple wrapper, but keep other actual exports (e.g., Button)
vi.mock('@heroui/react', async () => {
  const actual =
    await vi.importActual<typeof import('@heroui/react')>('@heroui/react')
  return {
    ...actual,
    ScrollShadow: ({
      children,
      className
    }: {
      children: ReactNode
      className?: string
    }) => (
      <div data-testid="scrollshadow" className={className}>
        {children}
      </div>
    )
  }
})

// Mock child components
vi.mock('../ModelSearchViewCard', () => ({
  ModelSearchViewCard: ({
    author,
    downloads,
    id,
    likes,
    tags
  }: {
    author: string
    downloads: number
    id: string
    likes: number
    tags: string[]
  }) => (
    <div data-testid="mock-view-card">
      <div>ID: {id}</div>
      <div>Author: {author}</div>
      <div>Downloads: {downloads}</div>
      <div>Likes: {likes}</div>
      <div>Tags: {tags.join(', ')}</div>
    </div>
  )
}))

vi.mock('../ModelSearchViewSpaces', () => ({
  ModelSearchViewSpaces: ({ spaces }: { spaces: string[] }) => (
    <div data-testid="mock-view-spaces">
      <div>Spaces: {spaces.length}</div>
    </div>
  )
}))

vi.mock('../ModelSearchViewFiles', () => ({
  ModelSearchViewFiles: ({
    id,
    siblings
  }: {
    id: string
    siblings: { blob_id: string; rfilename: string; size: number }[]
  }) => (
    <div data-testid="mock-view-files">
      <div>ID: {id}</div>
      <div>Siblings: {siblings.length}</div>
    </div>
  )
}))

vi.mock('../ModelSearchViewFooter', () => ({
  ModelSearchViewFooter: ({ id }: { id: string }) => (
    <div data-testid="mock-view-footer">
      <div>Footer ID: {id}</div>
    </div>
  )
}))

vi.mock('@/features/model-download-status-line', () => ({
  ModelDownloadStatusLine: () => (
    <div data-testid="mock-download-status-line">Download Status</div>
  )
}))

const useDownloadWatcherMock = vi.fn()

vi.mock('@/features/download-watcher', () => ({
  useDownloadWatcher: () => useDownloadWatcherMock()
}))

// Import the component under test AFTER mocks so they take effect
import { ModelSearchView } from '../ModelSearchView'

describe('ModelSearchView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the mock implementation for each test
    useModelSearchViewMock.mockClear()

    // Set default mock return value for useDownloadWatcher
    useDownloadWatcherMock.mockReturnValue({
      isDownloading: true,
      step: null,
      percent: 0,
      downloadSized: 0,
      downloadTotalSized: 0,
      currentFile: 'N/A'
    })
  })

  it('renders nothing when no model details are available', () => {
    // Mock the hook to return undefined model details
    useModelSearchViewMock.mockReturnValue({
      modelDetails: undefined,
      isLoading: false,
      isError: false
    })

    render(<ModelSearchView />, {
      wrapper: createQueryClientWrapper()
    })

    // The component should render nothing when no model details are available
    // (SkeletonLoader creates an animation wrapper, but no actual content should be present)
    expect(screen.queryByTestId('mock-view-card')).not.toBeInTheDocument()
    expect(screen.queryByTestId('mock-view-spaces')).not.toBeInTheDocument()
    expect(screen.queryByTestId('mock-view-files')).not.toBeInTheDocument()
    expect(screen.queryByTestId('mock-view-footer')).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('mock-download-status-line')
    ).not.toBeInTheDocument()
  })

  it('renders all sections when model details are available', () => {
    // Set up mock to return model details
    useModelSearchViewMock.mockReturnValue({
      modelDetails: mockModelDetailsData,
      isLoading: false,
      isError: false
    })

    render(<ModelSearchView />, {
      wrapper: createQueryClientWrapper()
    })

    // Should render all sections
    expect(screen.getByTestId('mock-view-card')).toBeInTheDocument()
    expect(screen.getByTestId('mock-view-spaces')).toBeInTheDocument()
    expect(screen.getByTestId('mock-view-files')).toBeInTheDocument()
    expect(screen.getByTestId('mock-view-footer')).toBeInTheDocument()
    expect(screen.getByTestId('mock-download-status-line')).toBeInTheDocument()

    // Check the content of the card section
    expect(
      within(screen.getByTestId('mock-view-card')).getByText(
        'ID: test-model-123'
      )
    ).toBeInTheDocument()
    expect(
      within(screen.getByTestId('mock-view-card')).getByText(
        'Author: test-author'
      )
    ).toBeInTheDocument()
    expect(
      within(screen.getByTestId('mock-view-card')).getByText('Downloads: 5000')
    ).toBeInTheDocument()
    expect(
      within(screen.getByTestId('mock-view-card')).getByText('Likes: 1000')
    ).toBeInTheDocument()
    expect(
      within(screen.getByTestId('mock-view-card')).getByText('Tags: tag1, tag2')
    ).toBeInTheDocument()

    // Check the content of the spaces section
    expect(screen.getByText('Spaces: 2')).toBeInTheDocument()

    // Check the content of the files section
    expect(screen.getByText('Siblings: 2')).toBeInTheDocument()

    // Check the footer section
    expect(screen.getByText('Footer ID: test-model-123')).toBeInTheDocument()

    // Check the download status line is present
    expect(screen.getByText('Download Status')).toBeInTheDocument()
  })

  it('passes correct props to child components', () => {
    // Set up mock to return model details
    useModelSearchViewMock.mockReturnValue({
      modelDetails: mockModelDetailsData,
      isLoading: false,
      isError: false
    })

    render(<ModelSearchView />, {
      wrapper: createQueryClientWrapper()
    })

    // Verify that the model ID from the store is passed to useModelSearchView
    expect(useModelSearchViewMock).toHaveBeenCalledWith('test-model-123')

    // The ScrollShadow component should wrap the main view components
    const childComponents = screen.getAllByTestId(/mock-view-/)
    expect(childComponents).toHaveLength(4) // card, spaces, files, footer

    // The wrapper should have ScrollShadow styling
    const scrollShadow = screen.getByTestId('scrollshadow')
    expect(scrollShadow).toHaveClass(
      'flex',
      'flex-col',
      'gap-8',
      'p-4',
      'flex-1'
    )
  })

  it('hides download status line when not downloading', () => {
    // Mock useDownloadWatcher to return isDownloading: false
    useDownloadWatcherMock.mockReturnValue({
      isDownloading: false,
      step: null,
      percent: 0,
      downloadSized: 0,
      downloadTotalSized: 0,
      currentFile: 'N/A'
    })

    // Set up mock to return model details
    useModelSearchViewMock.mockReturnValue({
      modelDetails: mockModelDetailsData,
      isLoading: false,
      isError: false
    })

    render(<ModelSearchView />, {
      wrapper: createQueryClientWrapper()
    })

    // Download status line should NOT be present when isDownloading is false
    expect(
      screen.queryByTestId('mock-download-status-line')
    ).not.toBeInTheDocument()

    // But other sections should still render
    expect(screen.getByTestId('mock-view-card')).toBeInTheDocument()
    expect(screen.getByTestId('mock-view-footer')).toBeInTheDocument()
  })
})
