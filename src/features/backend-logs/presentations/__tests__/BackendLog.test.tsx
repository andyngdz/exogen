import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BackendLog } from '../BackendLog'

// Mock HeroUI components
const mockOnOpen = vi.fn()
const mockOnClose = vi.fn()

vi.mock('@heroui/react', () => ({
  Button: ({
    children,
    onPress,
    endContent,
    isIconOnly,
    'aria-label': ariaLabel
  }: {
    children?: React.ReactNode
    onPress: () => void
    endContent?: React.ReactNode
    isIconOnly?: boolean
    'aria-label'?: string
  }) => (
    <button
      onClick={onPress}
      data-testid={isIconOnly ? 'open-folder-button' : 'console-button'}
      aria-label={ariaLabel}
    >
      {children}
      {endContent}
    </button>
  ),
  Drawer: ({
    isOpen,
    children
  }: {
    isOpen: boolean
    children: React.ReactNode
  }) => (isOpen ? <div data-testid="drawer">{children}</div> : null),
  DrawerContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="drawer-content">{children}</div>
  ),
  DrawerHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="drawer-header">{children}</div>
  ),
  DrawerBody: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="drawer-body">{children}</div>
  ),
  useDisclosure: vi.fn(() => ({
    isOpen: false,
    onOpen: mockOnOpen,
    onClose: mockOnClose
  }))
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  SquareChevronRight: () => <span data-testid="icon" />,
  FolderOpen: () => <span data-testid="folder-icon" />
}))

// Mock BackendLogList
vi.mock('../BackendLogList', () => ({
  BackendLogList: () => <div data-testid="backend-log-list">Log List</div>
}))

import { useDisclosure } from '@heroui/react'

const mockUseDisclosure = vi.mocked(useDisclosure)

describe('BackendLog', () => {
  it('renders console button', () => {
    render(<BackendLog />)

    const button = screen.getByTestId('console-button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Console')
  })

  it('renders drawer when open', () => {
    mockUseDisclosure.mockReturnValue({
      isOpen: true,
      onOpen: mockOnOpen,
      onClose: mockOnClose,
      onOpenChange: vi.fn(),
      isControlled: false,
      getButtonProps: vi.fn(),
      getDisclosureProps: vi.fn()
    })

    render(<BackendLog />)

    expect(screen.getByTestId('drawer')).toBeInTheDocument()
    expect(screen.getByTestId('drawer-header')).toHaveTextContent(
      'Backend Logs'
    )
    expect(screen.getByTestId('backend-log-list')).toBeInTheDocument()
  })

  it('does not render drawer when closed', () => {
    mockUseDisclosure.mockReturnValue({
      isOpen: false,
      onOpen: mockOnOpen,
      onClose: mockOnClose,
      onOpenChange: vi.fn(),
      isControlled: false,
      getButtonProps: vi.fn(),
      getDisclosureProps: vi.fn()
    })

    render(<BackendLog />)

    expect(screen.queryByTestId('drawer')).not.toBeInTheDocument()
  })

  it('renders open folder button in drawer header', () => {
    mockUseDisclosure.mockReturnValue({
      isOpen: true,
      onOpen: mockOnOpen,
      onClose: mockOnClose,
      onOpenChange: vi.fn(),
      isControlled: false,
      getButtonProps: vi.fn(),
      getDisclosureProps: vi.fn()
    })

    render(<BackendLog />)

    const openFolderButton = screen.getByTestId('open-folder-button')
    expect(openFolderButton).toBeInTheDocument()
    expect(openFolderButton).toHaveAttribute(
      'aria-label',
      'Open backend folder'
    )
  })

  it('calls electronAPI.backend.openBackendFolder when folder button is clicked', () => {
    mockUseDisclosure.mockReturnValue({
      isOpen: true,
      onOpen: mockOnOpen,
      onClose: mockOnClose,
      onOpenChange: vi.fn(),
      isControlled: false,
      getButtonProps: vi.fn(),
      getDisclosureProps: vi.fn()
    })

    render(<BackendLog />)

    const openFolderButton = screen.getByTestId('open-folder-button')
    fireEvent.click(openFolderButton)

    expect(
      globalThis.window.electronAPI.backend.openBackendFolder
    ).toHaveBeenCalledTimes(1)
  })
})
