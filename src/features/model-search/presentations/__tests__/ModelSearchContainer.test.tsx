/**
 * @file Tests for the ModelSearchContainer component
 *
 * Tests that the ModelSearchContainer component:
 * - Sets up the FormProvider with correct configuration
 * - Renders the Allotment layout with appropriate panes
 * - Renders child components (ModelSearchInput, ModelSearchListModel, ModelSearchView)
 */

import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ModelSearchContainer } from '../ModelSearchContainer'

// Mock child components
vi.mock('../ModelSearchInput', async () => {
  const { useFormContext } =
    await vi.importActual<typeof import('react-hook-form')>('react-hook-form')

  return {
    ModelSearchInput: () => {
      useFormContext()
      return <div data-testid="mock-search-input">Search Input</div>
    }
  }
})

vi.mock('../ModelSearchListModel', () => ({
  ModelSearchListModel: () => (
    <div data-testid="mock-search-list">Model List</div>
  )
}))

vi.mock('../ModelSearchView', () => ({
  ModelSearchView: () => <div data-testid="mock-search-view">Model View</div>
}))

// Mock Allotment
vi.mock('allotment', () => {
  const MockAllotment = ({
    children,
    defaultSizes
  }: {
    children: React.ReactNode
    defaultSizes?: number[]
  }) => (
    <div
      data-testid="mock-allotment"
      data-default-sizes={JSON.stringify(defaultSizes)}
    >
      {children}
    </div>
  )

  type PaneProps = {
    children: React.ReactNode
    className?: string
    maxSize?: number
    minSize?: number
    preferredSize?: number
  }

  const MockAllotmentPane: React.FC<PaneProps> = ({
    children,
    className,
    maxSize,
    minSize,
    preferredSize
  }) => (
    <div
      data-testid="mock-allotment-pane"
      className={className}
      data-max-size={maxSize}
      data-min-size={minSize}
      data-preferred-size={preferredSize}
    >
      {children}
    </div>
  )
  MockAllotmentPane.displayName = 'MockAllotmentPane'
  MockAllotment.Pane = MockAllotmentPane

  return { Allotment: MockAllotment }
})

// Mock useForm to verify configuration
const useFormMock = vi.hoisted(() => vi.fn())
const mockFormMethods = {
  register: vi.fn(),
  handleSubmit: vi.fn(),
  watch: vi.fn(),
  formState: { errors: {} },
  reset: vi.fn(),
  control: {},
  setValue: vi.fn(),
  getValues: vi.fn()
}

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form')
  return {
    ...actual,
    useForm: useFormMock
  }
})

describe('ModelSearchContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useFormMock.mockReturnValue(mockFormMethods)
  })

  it('initializes react-hook-form with expected options', () => {
    render(<ModelSearchContainer />)
    expect(useFormMock).toHaveBeenCalledWith({
      mode: 'all',
      reValidateMode: 'onChange',
      defaultValues: { query: '' }
    })
  })

  it('renders all child components', () => {
    render(<ModelSearchContainer />)

    // Verify all components are rendered
    expect(screen.getByTestId('mock-search-input')).toBeInTheDocument()
    expect(screen.getByTestId('mock-search-list')).toBeInTheDocument()
    expect(screen.getByTestId('mock-search-view')).toBeInTheDocument()
  })

  it('renders the Allotment layout with correct configuration', () => {
    render(<ModelSearchContainer />)

    // Verify the Allotment component is rendered
    expect(screen.getByTestId('mock-allotment')).toBeInTheDocument()

    // Verify Allotment panes are rendered
    const panes = screen.getAllByTestId('mock-allotment-pane')
    expect(panes.length).toBe(2)

    // The second pane should have the flex flex-col class
    expect(panes[1]).toHaveClass('flex')
    expect(panes[1]).toHaveClass('flex-col')
  })

  it('provides react-hook-form context to children', () => {
    render(<ModelSearchContainer />)
    expect(screen.getByTestId('mock-search-input')).toBeInTheDocument()
  })
})
