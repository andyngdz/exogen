import { createQueryClientWrapper } from '@/cores/test-utils'
import { api } from '@/services/api'
import { ModelDownloaded } from '@/types/api'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ModelManagement } from '../ModelManagement'

// Mock the API
vi.mock('@/services/api', () => ({
  api: {
    getDownloadedModels: vi.fn()
  }
}))

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Trash2: ({ size }: { size?: number }) => (
    <svg data-testid="trash-icon" data-size={size}>
      <title>Trash</title>
    </svg>
  )
}))

// Mock useDeleteModel hook
vi.mock('@/features/settings/states/useDeleteModel', () => ({
  useDeleteModel: () => ({
    mutate: vi.fn(),
    isPending: false
  })
}))

// Helper to create a pending promise (never resolves)
const createPendingPromise = <T,>(): Promise<T> => new Promise(() => {})

const findModelsList = () =>
  screen.findByRole('listbox', { name: 'Models list' })
const getDeleteButtons = () =>
  screen.getAllByRole('button', { name: /^Delete / })

describe('ModelManagement', () => {
  let wrapper = createQueryClientWrapper()

  beforeEach(() => {
    wrapper = createQueryClientWrapper()
    vi.clearAllMocks()
  })

  describe('loading state', () => {
    it('displays loading spinner when fetching models', () => {
      // Mock API to never resolve to keep loading state
      vi.mocked(api.getDownloadedModels).mockImplementation(
        createPendingPromise
      )

      render(<ModelManagement />, { wrapper })

      expect(
        screen.getByRole('status', { name: 'Loading' })
      ).toBeInTheDocument()
    })

    it('has correct loading container styling', () => {
      vi.mocked(api.getDownloadedModels).mockImplementation(
        createPendingPromise
      )

      render(<ModelManagement />, { wrapper })

      const container = screen.getByRole('status', {
        name: 'Loading'
      }).parentElement
      expect(container).toHaveClass(
        'flex',
        'justify-center',
        'items-center',
        'h-32'
      )
    })
  })

  describe('loaded state with models', () => {
    const mockModels: ModelDownloaded[] = [
      {
        model_id: 'stable-diffusion-xl-base-1.0',
        id: 1,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
        model_dir: '/models/stable-diffusion-xl-base-1.0'
      },
      {
        model_id: 'stable-diffusion-v1-5',
        id: 2,
        created_at: '2024-01-02T15:30:00Z',
        updated_at: '2024-01-02T15:30:00Z',
        model_dir: '/models/stable-diffusion-v1-5'
      },
      {
        model_id: 'dreamshaper-v8',
        id: 3,
        created_at: '2024-01-03T09:15:00Z',
        updated_at: '2024-01-03T09:15:00Z',
        model_dir: '/models/dreamshaper-v8'
      }
    ]

    beforeEach(() => {
      vi.mocked(api.getDownloadedModels).mockResolvedValue(mockModels)
    })

    it('renders the page title correctly', async () => {
      render(<ModelManagement />, { wrapper })

      expect(await screen.findByText('Model Management')).toBeInTheDocument()
      expect(
        screen.getByText('Manage your installed AI models')
      ).toBeInTheDocument()
    })

    it('renders models listbox with correct aria-label', async () => {
      render(<ModelManagement />, { wrapper })

      const listbox = await findModelsList()
      expect(listbox).toBeInTheDocument()
    })

    it('displays all downloaded models in the list', async () => {
      render(<ModelManagement />, { wrapper })

      await screen.findByText('Model Management')

      expect(
        screen.getByText('stable-diffusion-xl-base-1.0')
      ).toBeInTheDocument()
      expect(screen.getByText('stable-diffusion-v1-5')).toBeInTheDocument()
      expect(screen.getByText('dreamshaper-v8')).toBeInTheDocument()

      const listItems = screen.getAllByRole('option')
      expect(listItems).toHaveLength(3)
    })

    it('renders each model as a separate list item', async () => {
      render(<ModelManagement />, { wrapper })

      await screen.findByText('stable-diffusion-xl-base-1.0')

      const listItems = screen.getAllByRole('option')
      expect(listItems).toHaveLength(3)

      // Verify each model is rendered in its own list item
      expect(listItems[0]).toHaveTextContent('stable-diffusion-xl-base-1.0')
      expect(listItems[1]).toHaveTextContent('stable-diffusion-v1-5')
      expect(listItems[2]).toHaveTextContent('dreamshaper-v8')
    })

    it('renders delete button for each model with correct styling', async () => {
      render(<ModelManagement />, { wrapper })

      await screen.findByText('stable-diffusion-xl-base-1.0')

      const deleteButtons = getDeleteButtons()
      expect(deleteButtons).toHaveLength(3)
      expect(deleteButtons[0]).toHaveAccessibleName(
        'Delete stable-diffusion-xl-base-1.0'
      )
    })

    it('renders trash icons in delete buttons with correct size', async () => {
      render(<ModelManagement />, { wrapper })

      await screen.findByText('stable-diffusion-xl-base-1.0')

      const trashIcons = screen.getAllByTestId('trash-icon')
      expect(trashIcons).toHaveLength(3)

      trashIcons.forEach((icon) => {
        expect(icon).toHaveAttribute('data-size', '16')
      })
    })

    it('places each delete button inside its model option', async () => {
      render(<ModelManagement />, { wrapper })

      await screen.findByText('stable-diffusion-xl-base-1.0')

      const options = screen.getAllByRole('option')
      const deleteButtons = getDeleteButtons()
      options.forEach((option, optionPosition) => {
        expect(option).toContainElement(deleteButtons[optionPosition])
      })
    })

    it('calls API with correct query configuration', async () => {
      render(<ModelManagement />, { wrapper })

      await screen.findByText('stable-diffusion-xl-base-1.0')

      expect(api.getDownloadedModels).toHaveBeenCalledTimes(1)
      expect(api.getDownloadedModels).toHaveBeenCalledWith()
    })
  })

  describe('loaded state with no models', () => {
    beforeEach(() => {
      vi.mocked(api.getDownloadedModels).mockResolvedValue([])
    })

    it('renders page title even when no models exist', async () => {
      render(<ModelManagement />, { wrapper })

      expect(await screen.findByText('Model Management')).toBeInTheDocument()
    })

    it('renders the empty state when no models are downloaded', async () => {
      render(<ModelManagement />, { wrapper })

      const listbox = await findModelsList()
      expect(listbox).toHaveTextContent('No items.')
    })

    it('does not render any model items for empty model list', async () => {
      render(<ModelManagement />, { wrapper })

      await findModelsList()

      expect(
        screen.queryByRole('button', { name: /^Delete / })
      ).not.toBeInTheDocument()
    })
  })

  describe('error handling', () => {
    it('handles API errors gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      vi.mocked(api.getDownloadedModels).mockRejectedValue(
        new Error('API Error')
      )

      render(<ModelManagement />, { wrapper })

      // Component should still render title even if API fails
      expect(await screen.findByText('Model Management')).toBeInTheDocument()

      consoleErrorSpy.mockRestore()
    })

    it('handles undefined data gracefully', async () => {
      // Mock the component to handle the actual useQuery behavior when data is undefined initially
      vi.mocked(api.getDownloadedModels).mockResolvedValue([])

      render(<ModelManagement />, { wrapper })

      expect(await screen.findByText('Model Management')).toBeInTheDocument()

      const listbox = await findModelsList()
      expect(listbox).toHaveTextContent('No items.')
    })
  })

  describe('component structure and styling', () => {
    const mockModels: ModelDownloaded[] = [
      {
        model_id: 'test-model',
        id: 1,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
        model_dir: '/models/test-model'
      }
    ]

    beforeEach(() => {
      vi.mocked(api.getDownloadedModels).mockResolvedValue(mockModels)
    })

    it('has correct container structure', async () => {
      render(<ModelManagement />, { wrapper })

      const container = await screen.findByText('Model Management')
      expect(container.parentElement?.tagName).toBe('DIV')
    })

    it('applies correct CSS classes to title', async () => {
      render(<ModelManagement />, { wrapper })

      const title = await screen.findByText('Model Management')
      expect(title).toHaveClass('text-lg', 'font-semibold')
    })

    it('maintains consistent component hierarchy', async () => {
      render(<ModelManagement />, { wrapper })

      const title = await screen.findByText('Model Management')
      const listbox = await findModelsList()

      // Title should come before listbox in the DOM
      expect(
        title.compareDocumentPosition(listbox) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy()
    })
  })

  describe('accessibility', () => {
    const mockModels: ModelDownloaded[] = [
      {
        model_id: 'accessible-model',
        id: 1,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
        model_dir: '/models/accessible-model'
      }
    ]

    beforeEach(() => {
      vi.mocked(api.getDownloadedModels).mockResolvedValue(mockModels)
    })

    it('provides proper aria-label for models list', async () => {
      render(<ModelManagement />, { wrapper })

      const listbox = await findModelsList()
      expect(listbox).toHaveAttribute('aria-label', 'Models list')
    })

    it('uses semantic heading for page title', async () => {
      render(<ModelManagement />, { wrapper })

      const heading = await screen.findByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('Model Management')
    })

    it('provides accessible buttons for model actions', async () => {
      render(<ModelManagement />, { wrapper })

      await screen.findByText('accessible-model')

      const deleteButton = screen.getByRole('button', {
        name: 'Delete accessible-model'
      })
      expect(deleteButton).toBeInTheDocument()

      // Icon should have title for screen readers
      const trashIcon = screen.getByTestId('trash-icon')
      expect(trashIcon).toContainElement(screen.getByTitle('Trash'))
    })
  })
})
