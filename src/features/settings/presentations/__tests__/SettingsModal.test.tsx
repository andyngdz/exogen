import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { SettingsModal } from '../SettingsModal'
import { SettingsTab } from '../../states/useSettingsStore'

const mockSetSelectedTab = vi.fn()
let mockSelectedTab: SettingsTab = SettingsTab.GENERAL

vi.mock('../../states/useSettingsStore', async () => {
  const actual = await vi.importActual<
    typeof import('../../states/useSettingsStore')
  >('../../states/useSettingsStore')

  return {
    ...actual,
    useSettingsStore: () => ({
      selectedTab: mockSelectedTab,
      setSelectedTab: mockSetSelectedTab
    })
  }
})

vi.mock('@heroui/react', () => ({
  Modal: ({
    isOpen,
    children,
    onClose
  }: {
    isOpen: boolean
    children: React.ReactNode
    onClose: VoidFunction
  }) =>
    isOpen ? (
      <div data-testid="modal" onClick={onClose}>
        {children}
      </div>
    ) : null,
  ModalContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="modal-content">{children}</div>
  ),
  ModalHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="modal-header">{children}</div>
  ),
  ModalBody: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="modal-body">{children}</div>
  ),
  Divider: () => <hr data-testid="divider" />,
  Tabs: ({
    children,
    selectedKey,
    onSelectionChange
  }: {
    children: React.ReactNode
    selectedKey?: string
    onSelectionChange?: (key: string) => void
  }) => (
    <div data-testid="tabs" data-selected-key={selectedKey}>
      {children}
      <button
        data-testid="change-tab-models"
        onClick={() => onSelectionChange?.('models')}
      >
        Change to models
      </button>
      <button
        data-testid="change-tab-updates"
        onClick={() => onSelectionChange?.('updates')}
      >
        Change to updates
      </button>
    </div>
  ),
  Tab: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section>
      <h3>{title}</h3>
      <div>{children}</div>
    </section>
  )
}))

vi.mock('../tabs', () => ({
  GeneralSettings: () => (
    <div data-testid="general-settings">General settings content</div>
  ),
  MemorySettings: () => (
    <div data-testid="memory-settings">Memory settings content</div>
  ),
  ModelManagement: () => (
    <div data-testid="model-management">Model management content</div>
  ),
  UpdateSettings: () => (
    <div data-testid="update-settings">Update settings content</div>
  )
}))

describe('SettingsModal', () => {
  beforeEach(() => {
    mockSelectedTab = SettingsTab.GENERAL
    vi.clearAllMocks()
  })

  describe('Modal Rendering', () => {
    it('renders the modal with all tabs when open', () => {
      render(<SettingsModal isOpen onClose={vi.fn()} />)

      expect(screen.getByTestId('modal')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('General')).toBeInTheDocument()
      expect(screen.getByText('Memory')).toBeInTheDocument()
      expect(screen.getByText('Model Management')).toBeInTheDocument()
      expect(screen.getByText('Updates')).toBeInTheDocument()
      expect(screen.getByTestId('general-settings')).toBeInTheDocument()
      expect(screen.getByTestId('memory-settings')).toBeInTheDocument()
      expect(screen.getByTestId('model-management')).toBeInTheDocument()
      expect(screen.getByTestId('update-settings')).toBeInTheDocument()
    })

    it('does not render the modal content when closed', () => {
      render(<SettingsModal isOpen={false} onClose={vi.fn()} />)

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
      expect(screen.queryByText('Settings')).not.toBeInTheDocument()
    })

    it('renders modal header with correct title', () => {
      render(<SettingsModal isOpen onClose={vi.fn()} />)

      const header = screen.getByTestId('modal-header')
      expect(header).toHaveTextContent('Settings')
    })

    it('renders divider between header and body', () => {
      render(<SettingsModal isOpen onClose={vi.fn()} />)

      expect(screen.getByTestId('divider')).toBeInTheDocument()
    })

    it('renders all four tab panels', () => {
      render(<SettingsModal isOpen onClose={vi.fn()} />)

      expect(screen.getByTestId('general-settings')).toBeInTheDocument()
      expect(screen.getByTestId('memory-settings')).toBeInTheDocument()
      expect(screen.getByTestId('model-management')).toBeInTheDocument()
      expect(screen.getByTestId('update-settings')).toBeInTheDocument()
    })
  })

  describe('Tab Selection', () => {
    it('displays the selected tab from store', () => {
      render(<SettingsModal isOpen onClose={vi.fn()} />)

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-selected-key', SettingsTab.GENERAL)
    })

    it('calls setSelectedTab when tab selection changes to models', async () => {
      const user = userEvent.setup()
      render(<SettingsModal isOpen onClose={vi.fn()} />)

      const changeButton = screen.getByTestId('change-tab-models')
      await user.click(changeButton)

      expect(mockSetSelectedTab).toHaveBeenCalledTimes(1)
      expect(mockSetSelectedTab).toHaveBeenCalledWith(SettingsTab.MODELS)
    })

    it('calls setSelectedTab when tab selection changes to updates', async () => {
      const user = userEvent.setup()
      render(<SettingsModal isOpen onClose={vi.fn()} />)

      const changeButton = screen.getByTestId('change-tab-updates')
      await user.click(changeButton)

      expect(mockSetSelectedTab).toHaveBeenCalledTimes(1)
      expect(mockSetSelectedTab).toHaveBeenCalledWith(SettingsTab.UPDATES)
    })

    it('respects the selectedTab prop from store', () => {
      mockSelectedTab = SettingsTab.MODELS
      render(<SettingsModal isOpen onClose={vi.fn()} />)

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-selected-key', SettingsTab.MODELS)
    })
  })

  describe('Modal Close', () => {
    it('calls onClose when modal close is triggered', async () => {
      const mockOnClose = vi.fn()
      const user = userEvent.setup()
      render(<SettingsModal isOpen onClose={mockOnClose} />)

      const modal = screen.getByTestId('modal')
      await user.click(modal)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('accepts onClose callback as prop', () => {
      const mockOnClose = vi.fn()
      render(<SettingsModal isOpen onClose={mockOnClose} />)

      // Component should render without errors
      expect(screen.getByTestId('modal')).toBeInTheDocument()
    })
  })

  describe('Store Integration', () => {
    it('uses selectedTab from settings store', () => {
      mockSelectedTab = SettingsTab.UPDATES
      render(<SettingsModal isOpen onClose={vi.fn()} />)

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-selected-key', SettingsTab.UPDATES)
    })

    it('uses setSelectedTab from settings store', async () => {
      const user = userEvent.setup()
      render(<SettingsModal isOpen onClose={vi.fn()} />)

      const changeButton = screen.getByTestId('change-tab-models')
      await user.click(changeButton)

      expect(mockSetSelectedTab).toHaveBeenCalled()
    })
  })
})
