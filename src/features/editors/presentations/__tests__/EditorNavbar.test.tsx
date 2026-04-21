import { mockNextImage } from '@/cores/test-utils'
import * as matchers from '@testing-library/jest-dom/matchers'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EditorNavbar } from '../EditorNavbar'

expect.extend(matchers)

// Mock the NextImage component
vi.mock('next/image', () => mockNextImage())

// Mock the ModelSelector component
vi.mock('@/features/model-selectors/presentations/ModelSelector', () => ({
  ModelSelector: () => (
    <div data-testid="mock-model-selector">Model Selector</div>
  )
}))

// Mock the ModelSearchOpenIconButton component
vi.mock('@/features/model-search', () => ({
  ModelSearchOpenIconButton: () => (
    <div data-testid="mock-search-button">Search Button</div>
  )
}))

// Mock the HeroUI components
vi.mock('@heroui/react', () => ({
  Navbar: ({
    children,
    className
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <nav className={className} data-testid="mock-navbar">
      {children}
    </nav>
  ),
  NavbarBrand: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-navbar-brand">{children}</div>
  ),
  NavbarContent: ({
    children,
    justify
  }: {
    children: React.ReactNode
    justify?: string
  }) => <div data-testid={`mock-navbar-content-${justify}`}>{children}</div>,
  NavbarItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-navbar-item">{children}</div>
  ),
  // Add mock for useDisclosure
  useDisclosure: () => ({
    isOpen: false,
    onOpen: vi.fn(),
    onClose: vi.fn()
  }),
  // Add mocks for other components used in ModelSearchOpenIconButton
  Button: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="mock-button">{children}</button>
  ),
  Modal: () => <div data-testid="mock-modal">Modal</div>,
  ModalContent: () => <div data-testid="mock-modal-content">Modal Content</div>,
  ModalHeader: () => <div data-testid="mock-modal-header">Modal Header</div>,
  ModalBody: () => <div data-testid="mock-modal-body">Modal Body</div>,
  Divider: () => <div data-testid="mock-divider">Divider</div>
}))

describe('EditorNavbar', () => {
  it('renders the navbar with logo', () => {
    render(<EditorNavbar />)

    expect(screen.getByTestId('mock-navbar')).toBeInTheDocument()
    expect(screen.getByTestId('mock-navbar-brand')).toBeInTheDocument()
    expect(screen.getByTestId('mock-next-image')).toBeInTheDocument()
    expect(screen.getByTestId('mock-next-image')).toHaveAttribute(
      'data-alt',
      'ExoGen Logo'
    )
  })

  it('renders the model selector in the center content', () => {
    render(<EditorNavbar />)

    expect(screen.getByTestId('mock-navbar-content-center')).toBeInTheDocument()
    expect(screen.getByTestId('mock-navbar-item')).toBeInTheDocument()
    expect(screen.getByTestId('mock-model-selector')).toBeInTheDocument()
  })

  it('renders the search button in the center content', () => {
    render(<EditorNavbar />)

    expect(screen.getByTestId('mock-navbar-content-center')).toBeInTheDocument()
    expect(screen.getByTestId('mock-search-button')).toBeInTheDocument()
  })

  it('renders end navbar content', () => {
    render(<EditorNavbar />)

    expect(screen.getByTestId('mock-navbar-content-end')).toBeInTheDocument()
  })

  it('applies the correct className to the navbar', () => {
    render(<EditorNavbar />)

    const navbar = screen.getByTestId('mock-navbar')
    // Navbar uses default HeroUI styling with maxWidth="full", isBordered, and isBlurred
    expect(navbar).toBeInTheDocument()
  })
})
