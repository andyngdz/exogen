import { GeneratorConfigFormValues } from '@/features/generator-configs/types/generator-config'
import { StyleItem, StyleSection } from '@/types'
import { createGeneratorConfigFormWrapper } from '@/cores/test-utils'
import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GeneratorConfigStyleSection } from '../GeneratorConfigStyleSection'

// Mock the GeneratorConfigStyleItem component
vi.mock('../GeneratorConfigStyleItem', () => ({
  GeneratorConfigStyleItem: ({ styleItem }: { styleItem: StyleItem }) => (
    <div
      data-testid={`style-item-${styleItem.id}`}
      data-style-name={styleItem.name}
    >
      {styleItem.name}
    </div>
  )
}))

// Mock style sections data
const mockStyleSections: StyleSection[] = [
  {
    id: 'anime',
    styles: [
      {
        id: 'anime-style-1',
        name: 'Anime Style 1',
        origin: 'Anime Origin',
        license: 'MIT',
        positive: 'Anime style description 1',
        image: 'anime1.jpg'
      },
      {
        id: 'anime-style-2',
        name: 'Anime Style 2',
        origin: 'Anime Origin',
        license: 'MIT',
        positive: 'Anime style description 2',
        image: 'anime2.jpg'
      }
    ]
  },
  {
    id: 'realistic',
    styles: [
      {
        id: 'realistic-style-1',
        name: 'Realistic Style 1',
        origin: 'Realistic Origin',
        license: 'MIT',
        positive: 'Realistic style description 1',
        image: 'realistic1.jpg'
      }
    ]
  }
]

const createWrapper = (defaultValues?: Partial<GeneratorConfigFormValues>) =>
  createGeneratorConfigFormWrapper({ overrides: defaultValues })

describe('GeneratorConfigStyleSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all style sections', () => {
    render(<GeneratorConfigStyleSection styleSections={mockStyleSections} />, {
      wrapper: createWrapper()
    })

    expect(screen.getByText('anime')).toBeInTheDocument()
    expect(screen.getByText('realistic')).toBeInTheDocument()
  })

  it('groups the chips of each section under its label', () => {
    render(<GeneratorConfigStyleSection styleSections={mockStyleSections} />, {
      wrapper: createWrapper()
    })

    const animeGroup = screen.getByRole('group', { name: 'anime' })

    expect(within(animeGroup).getByText('Anime Style 1')).toBeInTheDocument()
    expect(within(animeGroup).getByText('Anime Style 2')).toBeInTheDocument()
    expect(
      within(animeGroup).queryByText('Realistic Style 1')
    ).not.toBeInTheDocument()
  })

  it('renders all style items within sections', () => {
    render(<GeneratorConfigStyleSection styleSections={mockStyleSections} />, {
      wrapper: createWrapper()
    })

    // Check anime section styles
    expect(screen.getByTestId('style-item-anime-style-1')).toBeInTheDocument()
    expect(screen.getByTestId('style-item-anime-style-2')).toBeInTheDocument()
    expect(screen.getByText('Anime Style 1')).toBeInTheDocument()
    expect(screen.getByText('Anime Style 2')).toBeInTheDocument()

    // Check realistic section styles
    expect(
      screen.getByTestId('style-item-realistic-style-1')
    ).toBeInTheDocument()
    expect(screen.getByText('Realistic Style 1')).toBeInTheDocument()
  })

  it('renders sections in correct order', () => {
    render(<GeneratorConfigStyleSection styleSections={mockStyleSections} />, {
      wrapper: createWrapper()
    })

    const sections = screen.getAllByText(/anime|realistic/)
    expect(sections[0]).toHaveTextContent('anime')
    expect(sections[1]).toHaveTextContent('realistic')
  })

  it('renders style items in correct order within sections', () => {
    render(<GeneratorConfigStyleSection styleSections={mockStyleSections} />, {
      wrapper: createWrapper()
    })

    const animeStyles = screen.getAllByTestId(/style-item-anime-style-/)
    expect(animeStyles[0]).toHaveAttribute(
      'data-testid',
      'style-item-anime-style-1'
    )
    expect(animeStyles[1]).toHaveAttribute(
      'data-testid',
      'style-item-anime-style-2'
    )
  })

  it('handles empty style sections array', () => {
    render(<GeneratorConfigStyleSection styleSections={[]} />, {
      wrapper: createWrapper()
    })

    // Should render nothing when no sections
    expect(screen.queryByText(/anime|realistic/)).not.toBeInTheDocument()
  })

  it('handles sections with empty styles arrays', () => {
    const sectionsWithEmptyStyles: StyleSection[] = [
      {
        id: 'empty-section',
        styles: []
      }
    ]

    render(
      <GeneratorConfigStyleSection styleSections={sectionsWithEmptyStyles} />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('empty-section')).toBeInTheDocument()
    // Should not render any style items
    expect(screen.queryByTestId(/style-item-/)).not.toBeInTheDocument()
  })

  it('capitalizes section IDs in display', () => {
    const sectionsWithLowercaseIds: StyleSection[] = [
      {
        id: 'lowercase-section',
        styles: [
          {
            id: 'style-1',
            name: 'Style 1',
            origin: 'Origin',
            license: 'MIT',
            positive: 'Description',
            image: 'style1.jpg'
          }
        ]
      }
    ]

    render(
      <GeneratorConfigStyleSection styleSections={sectionsWithLowercaseIds} />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('lowercase-section')).toBeInTheDocument()
  })

  it('passes correct props to GeneratorConfigStyleItem components', () => {
    render(<GeneratorConfigStyleSection styleSections={mockStyleSections} />, {
      wrapper: createWrapper()
    })

    const animeStyle1 = screen.getByTestId('style-item-anime-style-1')
    expect(animeStyle1).toHaveAttribute('data-style-name', 'Anime Style 1')

    const realisticStyle1 = screen.getByTestId('style-item-realistic-style-1')
    expect(realisticStyle1).toHaveAttribute(
      'data-style-name',
      'Realistic Style 1'
    )
  })
})
