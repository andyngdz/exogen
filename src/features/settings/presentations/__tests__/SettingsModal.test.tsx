import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SettingsTab } from '../../states/useSettingsStore'
import { SettingsModal } from '../SettingsModal'

const mockSetSelectedTab = vi.fn()
let mockSelectedTab: SettingsTab = SettingsTab.GENERAL

vi.mock('../../states/useSettingsStore', async () => {
  const actual = await vi.importActual<
    typeof import('../../states/useSettingsStore')
  >('../../states/useSettingsStore')

  return {
    ...actual,
    useSettingsStore: (
      selector: (state: {
        selectedTab: SettingsTab
        setSelectedTab: typeof mockSetSelectedTab
      }) => unknown
    ) =>
      selector({
        selectedTab: mockSelectedTab,
        setSelectedTab: mockSetSelectedTab
      })
  }
})

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
    it('renders the dialog with all tabs when open', () => {
      render(<SettingsModal isOpen onOpenChange={vi.fn()} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: 'Settings' })
      ).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'General' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Memory' })).toBeInTheDocument()
      expect(
        screen.getByRole('tab', { name: 'Model Management' })
      ).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Updates' })).toBeInTheDocument()
    })

    it('does not render the dialog when closed', () => {
      render(<SettingsModal isOpen={false} onOpenChange={vi.fn()} />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(screen.queryByText('Settings')).not.toBeInTheDocument()
    })

    it('renders a separator between header and body', () => {
      render(<SettingsModal isOpen onOpenChange={vi.fn()} />)

      expect(screen.getByRole('separator')).toBeInTheDocument()
    })

    it('renders the panel of the selected tab', () => {
      render(<SettingsModal isOpen onOpenChange={vi.fn()} />)

      expect(screen.getByTestId('general-settings')).toBeInTheDocument()
      expect(screen.queryByTestId('update-settings')).not.toBeInTheDocument()
    })
  })

  describe('Tab Selection', () => {
    it('marks the tab from the store as selected', () => {
      render(<SettingsModal isOpen onOpenChange={vi.fn()} />)

      expect(screen.getByRole('tab', { name: 'General' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
    })

    it('calls setSelectedTab when the models tab is chosen', async () => {
      const user = userEvent.setup()
      render(<SettingsModal isOpen onOpenChange={vi.fn()} />)

      await user.click(screen.getByRole('tab', { name: 'Model Management' }))

      expect(mockSetSelectedTab).toHaveBeenCalledTimes(1)
      expect(mockSetSelectedTab).toHaveBeenCalledWith(SettingsTab.MODELS)
    })

    it('calls setSelectedTab when the updates tab is chosen', async () => {
      const user = userEvent.setup()
      render(<SettingsModal isOpen onOpenChange={vi.fn()} />)

      await user.click(screen.getByRole('tab', { name: 'Updates' }))

      expect(mockSetSelectedTab).toHaveBeenCalledTimes(1)
      expect(mockSetSelectedTab).toHaveBeenCalledWith(SettingsTab.UPDATES)
    })

    it('opens on the tab stored in the settings store', () => {
      mockSelectedTab = SettingsTab.UPDATES
      render(<SettingsModal isOpen onOpenChange={vi.fn()} />)

      expect(screen.getByRole('tab', { name: 'Updates' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
      expect(screen.getByTestId('update-settings')).toBeInTheDocument()
    })
  })

  describe('Modal Close', () => {
    it('requests close when the close button is pressed', async () => {
      const mockOnOpenChange = vi.fn()
      const user = userEvent.setup()
      render(<SettingsModal isOpen onOpenChange={mockOnOpenChange} />)

      await user.click(screen.getByRole('button', { name: /close/i }))

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })
})
