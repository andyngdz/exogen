import { StyleSection } from '@/types'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GeneratorConfigStyleModal } from '../GeneratorConfigStyleModal'

// Mock GeneratorConfigStyleSection component
vi.mock('../GeneratorConfigStyleSection', () => ({
  GeneratorConfigStyleSection: ({
    styleSections
  }: {
    styleSections: StyleSection[]
  }) => (
    <div data-testid="generator-config-style-section">
      {styleSections.map((section) => (
        <div key={section.id} data-testid={`style-section-${section.id}`}>
          {section.styles.length} styles
        </div>
      ))}
    </div>
  )
}))

// Mock GeneratorConfigStyleSearchInput component
vi.mock('../GeneratorConfigStyleSearchInput', () => ({
  GeneratorConfigStyleSearchInput: ({
    value,
    onChange,
    onClear
  }: {
    value: string
    onChange: (value: string) => void
    onClear: VoidFunction
  }) => (
    <div data-testid="search-input">
      <input
        data-testid="search-input-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button data-testid="search-clear-button" onClick={onClear}>
        Clear
      </button>
    </div>
  )
}))

// Mock GeneratorConfigStyleEmptyState component
vi.mock('../GeneratorConfigStyleEmptyState', () => ({
  GeneratorConfigStyleEmptyState: ({ query }: { query: string }) => (
    <div data-testid="empty-state">No results for &quot;{query}&quot;</div>
  )
}))

describe('GeneratorConfigStyleModal', () => {
  const mockStyleSections: StyleSection[] = [
    {
      id: 'abstract',
      styles: [
        {
          id: 'style-1',
          name: 'Abstract Style 1',
          origin: 'Test Origin',
          license: 'MIT',
          positive: 'abstract, colorful',
          negative: 'realistic',
          image: '/test-image-1.jpg'
        },
        {
          id: 'style-2',
          name: 'Abstract Style 2',
          origin: 'Test Origin 2',
          license: 'CC0',
          positive: 'surreal, artistic',
          image: '/test-image-2.jpg'
        }
      ]
    },
    {
      id: 'realistic',
      styles: [
        {
          id: 'style-3',
          name: 'Realistic Style 1',
          origin: 'Test Origin 3',
          license: 'GPL',
          positive: 'photorealistic, detailed',
          negative: 'cartoon',
          image: '/test-image-3.jpg'
        }
      ]
    }
  ]

  const defaultProps = {
    styleSections: mockStyleSections,
    isOpen: true,
    onOpenChange: vi.fn()
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders an open dialog with the Styles heading', () => {
      render(<GeneratorConfigStyleModal {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: 'Styles' })
      ).toBeInTheDocument()
    })

    it('renders the NSFW warning chip', () => {
      render(<GeneratorConfigStyleModal {...defaultProps} />)

      expect(
        screen.getByText(
          'Some styles may contain NSFW content. Please preview before applying'
        )
      ).toBeInTheDocument()
    })

    it('renders GeneratorConfigStyleSection with style sections', () => {
      render(<GeneratorConfigStyleModal {...defaultProps} />)

      expect(
        screen.getByTestId('generator-config-style-section')
      ).toBeInTheDocument()
      expect(screen.getByTestId('style-section-abstract')).toHaveTextContent(
        '2 styles'
      )
      expect(screen.getByTestId('style-section-realistic')).toHaveTextContent(
        '1 styles'
      )
    })
  })

  describe('Modal state', () => {
    it('renders nothing when closed', () => {
      render(<GeneratorConfigStyleModal {...defaultProps} isOpen={false} />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('requests close when the close button is pressed', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(
        <GeneratorConfigStyleModal
          {...defaultProps}
          onOpenChange={onOpenChange}
        />
      )

      await user.click(screen.getByRole('button', { name: /close/i }))

      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('Header Styling', () => {
    it('lays the header out as a row', () => {
      render(<GeneratorConfigStyleModal {...defaultProps} />)

      const header = screen.getByRole('heading', {
        name: 'Styles'
      }).parentElement
      expect(header).toHaveClass(
        'flex',
        'justify-between',
        'items-center',
        'gap-2'
      )
    })
  })

  describe('Edge Cases', () => {
    it('renders with empty style sections array', () => {
      const emptyProps = {
        ...defaultProps,
        styleSections: []
      }

      render(<GeneratorConfigStyleModal {...emptyProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(
        screen.getByTestId('generator-config-style-section')
      ).toBeInTheDocument()
      expect(screen.queryByTestId(/style-section-/)).not.toBeInTheDocument()
    })

    it('renders with single style section', () => {
      const singleSectionProps = {
        ...defaultProps,
        styleSections: [mockStyleSections[0]]
      }

      render(<GeneratorConfigStyleModal {...singleSectionProps} />)

      expect(screen.getByTestId('style-section-abstract')).toBeInTheDocument()
      expect(
        screen.queryByTestId('style-section-realistic')
      ).not.toBeInTheDocument()
    })

    it('handles style sections with no styles', () => {
      const emptySectionProps = {
        ...defaultProps,
        styleSections: [
          {
            id: 'empty-section',
            styles: []
          }
        ]
      }

      render(<GeneratorConfigStyleModal {...emptySectionProps} />)

      expect(
        screen.getByTestId('style-section-empty-section')
      ).toHaveTextContent('0 styles')
    })
  })

  describe('Props Interface', () => {
    it('renders closed when only style sections are passed', () => {
      expect(() =>
        render(<GeneratorConfigStyleModal styleSections={mockStyleSections} />)
      ).not.toThrow()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('renders search input', () => {
      render(<GeneratorConfigStyleModal {...defaultProps} />)

      expect(screen.getByTestId('search-input')).toBeInTheDocument()
      expect(screen.getByTestId('search-input-field')).toBeInTheDocument()
    })

    it('renders search input in separate filter row', () => {
      const { container } = render(
        <GeneratorConfigStyleModal {...defaultProps} />
      )

      const filterRow = container.ownerDocument.querySelector('.pb-4')
      expect(filterRow).toBeInTheDocument()
      expect(filterRow).toContainElement(screen.getByTestId('search-input'))
    })

    it('allows user to type in search input', async () => {
      const user = userEvent.setup()
      render(<GeneratorConfigStyleModal {...defaultProps} />)

      const searchInput = screen.getByTestId('search-input-field')
      await user.type(searchInput, 'abstract')

      expect(searchInput).toHaveValue('abstract')
    })

    it('clears search when clear button is clicked', async () => {
      const user = userEvent.setup()
      render(<GeneratorConfigStyleModal {...defaultProps} />)

      const searchInput = screen.getByTestId('search-input-field')
      await user.type(searchInput, 'test')

      const clearButton = screen.getByTestId('search-clear-button')
      await user.click(clearButton)

      expect(searchInput).toHaveValue('')
    })

    it('shows empty state when no results match search query', async () => {
      const user = userEvent.setup()
      render(<GeneratorConfigStyleModal {...defaultProps} />)

      const searchInput = screen.getByTestId('search-input-field')
      await user.type(searchInput, 'nonexistent')

      await waitFor(
        () => {
          expect(screen.queryByTestId('empty-state')).toBeInTheDocument()
        },
        { timeout: 500 }
      )

      expect(
        screen.queryByTestId('generator-config-style-section')
      ).not.toBeInTheDocument()
    })

    it('shows style sections when search has results', () => {
      render(<GeneratorConfigStyleModal {...defaultProps} />)

      expect(
        screen.getByTestId('generator-config-style-section')
      ).toBeInTheDocument()
      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
    })

    it('filters style sections based on search query', async () => {
      const user = userEvent.setup()
      render(<GeneratorConfigStyleModal {...defaultProps} />)

      const searchInput = screen.getByTestId('search-input-field')
      await user.type(searchInput, 'abstract')

      expect(screen.getByTestId('style-section-abstract')).toBeInTheDocument()
    })
  })
})
