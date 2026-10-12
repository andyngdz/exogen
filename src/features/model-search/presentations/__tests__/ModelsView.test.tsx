import { useDownloadedModels } from '@/cores/hooks'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ModelsView } from '../ModelsView'

const push = vi.fn()

vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))
vi.mock('@/cores/hooks', () => ({ useDownloadedModels: vi.fn() }))
vi.mock('@/features/settings/presentations/tabs', () => ({
  ModelManagement: () => <div>Installed list</div>
}))
vi.mock('../ModelsHuggingFace', () => ({
  ModelsHuggingFace: () => <div>Hugging Face results</div>
}))
vi.mock('../ModelSearchInput', () => ({
  ModelSearchInput: () => <input aria-label="Search models" />
}))

const mockInstalled = (count: number) =>
  vi.mocked(useDownloadedModels).mockReturnValue({
    downloadedModels: Array.from({ length: count }, (_, index) => ({
      model_id: `model-${index}`
    })),
    onCheckDownloaded: vi.fn()
  } as unknown as ReturnType<typeof useDownloadedModels>)

describe('ModelsView', () => {
  beforeEach(() => {
    push.mockClear()
  })

  it('lists installed models and switches to the Hugging Face search', async () => {
    const user = userEvent.setup()
    mockInstalled(2)
    render(<ModelsView />)

    expect(screen.getByRole('radio', { name: 'Installed 2' })).toBeChecked()
    expect(screen.getByText('Installed list')).toBeInTheDocument()
    expect(screen.queryByLabelText('Search models')).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Hugging Face' }))

    expect(screen.getByText('Hugging Face results')).toBeInTheDocument()
    expect(screen.getByLabelText('Search models')).toBeInTheDocument()
  })

  it('offers recommendations and a search when nothing is installed', async () => {
    const user = userEvent.setup()
    mockInstalled(0)
    render(<ModelsView />)

    expect(screen.getByText('No models installed')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'See recommended' }))
    expect(push).toHaveBeenCalledWith('/model-recommendations')

    await user.click(
      screen.getByRole('button', { name: 'Search Hugging Face' })
    )
    expect(screen.getByText('Hugging Face results')).toBeInTheDocument()
  })
})
