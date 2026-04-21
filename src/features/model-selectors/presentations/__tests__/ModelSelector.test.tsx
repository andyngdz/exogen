import { useDownloadedModels } from '@/cores/hooks'
import { ModelDownloaded } from '@/types/api'
import { ModelFamily } from '@/types'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useModelSelectors } from '../../states/useModelSelectors'
import { useModelSelectorStore } from '../../states/useModelSelectorStores'
import { ModelSelector } from '../ModelSelector'

// Mock dependencies
vi.mock('../../states/useModelSelectors', () => ({
  useModelSelectors: vi.fn()
}))

vi.mock('../../states/useModelSelectorStores', () => ({
  useModelSelectorStore: vi.fn()
}))

vi.mock('@/cores/hooks', () => ({
  useDownloadedModels: vi.fn()
}))

describe('ModelSelector', () => {
  const mockSetId = vi.fn()
  const mockModels: ModelDownloaded[] = [
    {
      model_id: 'model-1',
      id: 1,
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
      model_dir: '/path/to/model-1'
    },
    {
      model_id: 'model-2',
      id: 2,
      created_at: '2023-01-02',
      updated_at: '2023-01-02',
      model_dir: '/path/to/model-2'
    }
  ]

  beforeEach(() => {
    vi.resetAllMocks()

    vi.mocked(useModelSelectors).mockReturnValue(undefined)

    vi.mocked(useDownloadedModels).mockReturnValue({
      downloadedModels: mockModels,
      onCheckDownloaded: vi.fn()
    })

    vi.mocked(useModelSelectorStore).mockReturnValue({
      selected_model_id: 'model-1',
      loaded_model_family: ModelFamily.UNKNOWN,
      setSelectedModelId: mockSetId,
      setLoadedModelFamily: vi.fn()
    })
  })

  it('should render the dropdown with current model id', () => {
    render(<ModelSelector />)

    // Check that the button with the current model ID is rendered
    expect(screen.getByRole('button', { name: /model-1/i })).toBeInTheDocument()
  })

  it.each([
    [ModelFamily.SD15, 'SD 1.5'],
    [ModelFamily.SDXL, 'SDXL'],
    [ModelFamily.SD2, 'SD 2.x'],
    [ModelFamily.SD3, 'SD3'],
    [ModelFamily.FLUX, 'FLUX']
  ])('shows model family label: %s', (family, label) => {
    vi.mocked(useModelSelectorStore).mockReturnValue({
      selected_model_id: 'model-1',
      loaded_model_family: family,
      setSelectedModelId: mockSetId,
      setLoadedModelFamily: vi.fn()
    })

    render(<ModelSelector />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('does not show model family label when unknown', () => {
    vi.mocked(useModelSelectorStore).mockReturnValue({
      selected_model_id: 'model-1',
      loaded_model_family: ModelFamily.UNKNOWN,
      setSelectedModelId: mockSetId,
      setLoadedModelFamily: vi.fn()
    })

    render(<ModelSelector />)
    expect(screen.queryByText('SD 1.5')).not.toBeInTheDocument()
    expect(screen.queryByText('SDXL')).not.toBeInTheDocument()
    expect(screen.queryByText('SD 2.x')).not.toBeInTheDocument()
    expect(screen.queryByText('SD3')).not.toBeInTheDocument()
    expect(screen.queryByText('FLUX')).not.toBeInTheDocument()
  })

  it('does not show model family label for unexpected family', () => {
    vi.mocked(useModelSelectorStore).mockReturnValue({
      selected_model_id: 'model-1',
      loaded_model_family: 'unexpected' as unknown as ModelFamily,
      setSelectedModelId: mockSetId,
      setLoadedModelFamily: vi.fn()
    })

    render(<ModelSelector />)
    expect(screen.queryByText('SD 1.5')).not.toBeInTheDocument()
    expect(screen.queryByText('SDXL')).not.toBeInTheDocument()
    expect(screen.queryByText('SD 2.x')).not.toBeInTheDocument()
    expect(screen.queryByText('SD3')).not.toBeInTheDocument()
    expect(screen.queryByText('FLUX')).not.toBeInTheDocument()
  })

  it('should render dropdown even when no data is available', () => {
    // Set data to empty array
    vi.mocked(useDownloadedModels).mockReturnValue({
      downloadedModels: [],
      onCheckDownloaded: vi.fn()
    })

    render(<ModelSelector />)

    // Should still render the dropdown button, even with no items
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should display all model options in the dropdown', async () => {
    const user = userEvent.setup()
    render(<ModelSelector />)

    // Open the dropdown
    await user.click(screen.getByRole('button'))

    // Check that all model options are displayed
    // Use getAllByText and check count since there are multiple elements with these texts
    expect(screen.getAllByText('model-1').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('model-2').length).toBeGreaterThanOrEqual(1)
  })

  it('should call setId when a different model is selected', async () => {
    const user = userEvent.setup()
    render(<ModelSelector />)

    // Open the dropdown
    await user.click(screen.getByRole('button'))

    // Select a different model
    await user.click(screen.getByText('model-2'))

    // Check that setId was called with the correct model ID
    expect(mockSetId).toHaveBeenCalledWith('model-2')
  })
})
