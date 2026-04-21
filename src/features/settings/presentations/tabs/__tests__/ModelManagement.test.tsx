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

// Mock HeroUI components
vi.mock('@heroui/react', () => ({
  Listbox: ({ children, ...props }: { children: React.ReactNode }) => (
    <ul data-testid="listbox" {...props}>
      {children}
    </ul>
  ),
  ListboxItem: ({
    children,
    endContent,
    ...props
  }: {
    children: React.ReactNode
    endContent?: React.ReactNode
  }) => (
    <li data-testid="listbox-item" {...props}>
      {children}
      {endContent && <div data-testid="item-end-content">{endContent}</div>}
    </li>
  ),
  Button: ({
    children,
    isIconOnly,
    variant,
    color,
    onPress,
    isDisabled,
    isLoading,
    ...props
  }: {
    children: React.ReactNode
    isIconOnly?: boolean
    variant?: string
    color?: string
    onPress?: () => void
    isDisabled?: boolean
    isLoading?: boolean
  }) => (
    <button
      data-testid="delete-button"
      data-variant={variant}
      data-color={color}
      data-icon-only={isIconOnly}
      onClick={onPress}
      disabled={isDisabled || isLoading}
      {...props}
    >
      {children}
    </button>
  ),
  Spinner: ({ size }: { size?: string }) => (
    <div data-testid="spinner" data-size={size}>
      Loading...
    </div>
  ),
  Modal: ({
    children,
    isOpen
  }: {
    children: React.ReactNode
    isOpen: boolean
  }) => (isOpen ? <div data-testid="modal">{children}</div> : null),
  ModalContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="modal-content">{children}</div>
  ),
  ModalHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="modal-header">{children}</div>
  ),
  ModalBody: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="modal-body">{children}</div>
  ),
  ModalFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="modal-footer">{children}</div>
  ),
  Divider: () => <hr />
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

      expect(screen.getByTestId('spinner')).toBeInTheDocument()
      expect(screen.getByTestId('spinner')).toHaveAttribute('data-size', 'lg')
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('has correct loading container styling', () => {
      vi.mocked(api.getDownloadedModels).mockImplementation(
        createPendingPromise
      )

      render(<ModelManagement />, { wrapper })

      const container = screen.getByTestId('spinner').parentElement
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

      const listbox = await screen.findByTestId('listbox')
      expect(listbox).toBeInTheDocument()
      expect(listbox).toHaveAttribute('aria-label', 'Models list')
    })

    it('displays all downloaded models in the list', async () => {
      render(<ModelManagement />, { wrapper })

      await screen.findByText('Model Management')

      expect(
        screen.getByText('stable-diffusion-xl-base-1.0')
      ).toBeInTheDocument()
      expect(screen.getByText('stable-diffusion-v1-5')).toBeInTheDocument()
      expect(screen.getByText('dreamshaper-v8')).toBeInTheDocument()

      const listItems = screen.getAllByTestId('listbox-item')
      expect(listItems).toHaveLength(3)
    })

    it('renders each model as a separate list item', async () => {
      render(<ModelManagement />, { wrapper })

      await screen.findByText('stable-diffusion-xl-base-1.0')

      const listItems = screen.getAllByTestId('listbox-item')
      expect(listItems).toHaveLength(3)

      // Verify each model is rendered in its own list item
      expect(listItems[0]).toHaveTextContent('stable-diffusion-xl-base-1.0')
      expect(listItems[1]).toHaveTextContent('stable-diffusion-v1-5')
      expect(listItems[2]).toHaveTextContent('dreamshaper-v8')
    })

    it('renders delete button for each model with correct styling', async () => {
      render(<ModelManagement />, { wrapper })

      await screen.findByText('stable-diffusion-xl-base-1.0')

      const deleteButtons = screen.getAllByTestId('delete-button')
      expect(deleteButtons).toHaveLength(3)

      deleteButtons.forEach((button) => {
        expect(button).toHaveAttribute('data-icon-only', 'true')
        expect(button).toHaveAttribute('data-variant', 'light')
        expect(button).toHaveAttribute('data-color', 'danger')
      })
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

    it('positions delete buttons as end content', async () => {
      render(<ModelManagement />, { wrapper })

      await screen.findByText('stable-diffusion-xl-base-1.0')

      const endContent = screen.getAllByTestId('item-end-content')
      expect(endContent).toHaveLength(3)

      const deleteButtons = screen.getAllByTestId('delete-button')
      endContent.forEach((content, index) => {
        expect(content).toContainElement(deleteButtons[index])
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

    it('renders empty listbox when no models are downloaded', async () => {
      render(<ModelManagement />, { wrapper })

      const listbox = await screen.findByTestId('listbox')
      expect(listbox).toBeInTheDocument()
      expect(listbox).toBeEmptyDOMElement()
    })

    it('does not render any listbox items for empty model list', async () => {
      render(<ModelManagement />, { wrapper })

      await screen.findByTestId('listbox')

      expect(screen.queryByTestId('listbox-item')).not.toBeInTheDocument()
      expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument()
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

      const listbox = screen.getByTestId('listbox')
      expect(listbox).toBeInTheDocument()
      expect(listbox).toBeEmptyDOMElement()
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
      const listbox = await screen.findByTestId('listbox')

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

      const listbox = await screen.findByTestId('listbox')
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

      const deleteButton = screen.getByTestId('delete-button')
      expect(deleteButton).toBeInTheDocument()

      // Icon should have title for screen readers
      const trashIcon = screen.getByTestId('trash-icon')
      expect(trashIcon).toContainElement(screen.getByTitle('Trash'))
    })
  })
})
