import { UpscaleFactor } from '@/cores/constants'
import { GeneratorConfigFormValues } from '@/features/generator-configs/types/generator-config'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UseFormReturn } from 'react-hook-form'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GeneratorConfigHiresFixUpscaleFactor } from '../GeneratorConfigHiresFixUpscaleFactor'

// Mock HeroUI components
vi.mock('@heroui/react', () => {
  // Inline the upscale factors for the mock
  const factors = [
    { value: 1.5, label: '1.5x' },
    { value: 2, label: '2x' },
    { value: 3, label: '3x' },
    { value: 4, label: '4x' }
  ]

  return {
    Select: ({
      label,
      selectedKeys,
      onSelectionChange,
      'aria-label': ariaLabel
    }: {
      label: string
      selectedKeys: string[]
      onSelectionChange: (keys: { currentKey: string | null }) => void
      children: React.ReactNode
      'aria-label': string
    }) => {
      return (
        <div data-testid="select" aria-label={ariaLabel}>
          <label>{label}</label>
          <select
            data-testid="select-input"
            value={selectedKeys?.[0] || ''}
            onChange={(e) =>
              onSelectionChange({ currentKey: e.target.value || null })
            }
          >
            {factors.map((factor) => (
              <option key={factor.value} value={factor.value.toString()}>
                {factor.label}
              </option>
            ))}
          </select>
        </div>
      )
    },
    SelectItem: () => null,
    Skeleton: ({ className }: { className: string }) => (
      <div data-testid="skeleton" className={className}>
        Loading...
      </div>
    )
  }
})

// Mock constants
vi.mock('../../constants', () => ({
  UPSCALE_FACTORS: [
    { value: 1.5, label: '1.5x' },
    { value: 2, label: '2x' },
    { value: 3, label: '3x' },
    { value: 4, label: '4x' }
  ]
}))

// Mock react-hook-form
const mockOnChange = vi.fn()
const mockControl = {} as UseFormReturn<GeneratorConfigFormValues>['control']
let mockFieldValue: number | undefined = UpscaleFactor.TWO

vi.mock('react-hook-form', () => ({
  useFormContext: () => ({
    control: mockControl
  }),
  Controller: ({
    render
  }: {
    render: (props: {
      field: { value: number | undefined; onChange: (v: number) => void }
    }) => React.ReactNode
  }) => {
    const mockField = {
      value: mockFieldValue,
      onChange: mockOnChange
    }
    return <>{render({ field: mockField })}</>
  }
}))

describe('GeneratorConfigHiresFixUpscaleFactor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFieldValue = UpscaleFactor.TWO
  })

  it('renders without crashing', () => {
    const { container } = render(<GeneratorConfigHiresFixUpscaleFactor />)
    expect(container).toBeInTheDocument()
  })

  it('renders select with correct label', () => {
    render(<GeneratorConfigHiresFixUpscaleFactor />)

    expect(screen.getByText('Upscale Factor')).toBeInTheDocument()
  })

  it('renders select with correct aria-label', () => {
    render(<GeneratorConfigHiresFixUpscaleFactor />)

    expect(screen.getByLabelText('Upscale Factor')).toBeInTheDocument()
  })

  it('displays all upscale factor options', () => {
    render(<GeneratorConfigHiresFixUpscaleFactor />)

    expect(screen.getByText('1.5x')).toBeInTheDocument()
    expect(screen.getByText('2x')).toBeInTheDocument()
    expect(screen.getByText('3x')).toBeInTheDocument()
    expect(screen.getByText('4x')).toBeInTheDocument()
  })

  it('displays selected value', () => {
    render(<GeneratorConfigHiresFixUpscaleFactor />)
    const select = screen.getByTestId('select-input') as HTMLSelectElement

    expect(select.value).toBe('2')
  })

  it('calls onChange when selection changes', async () => {
    const user = userEvent.setup()
    render(<GeneratorConfigHiresFixUpscaleFactor />)
    const select = screen.getByTestId('select-input')

    await user.selectOptions(select, '3')

    expect(mockOnChange).toHaveBeenCalledWith(3)
  })

  it('converts string value to number on change', async () => {
    const user = userEvent.setup()
    render(<GeneratorConfigHiresFixUpscaleFactor />)
    const select = screen.getByTestId('select-input')

    await user.selectOptions(select, '1.5')

    expect(mockOnChange).toHaveBeenCalledWith(1.5)
    expect(typeof mockOnChange.mock.calls[0][0]).toBe('number')
  })

  describe('skeleton state', () => {
    it('shows skeleton when value is undefined', () => {
      mockFieldValue = undefined
      render(<GeneratorConfigHiresFixUpscaleFactor />)

      expect(screen.getByTestId('skeleton')).toBeInTheDocument()
      expect(screen.queryByTestId('select')).not.toBeInTheDocument()
    })

    it('skeleton has correct class', () => {
      mockFieldValue = undefined
      render(<GeneratorConfigHiresFixUpscaleFactor />)
      const skeleton = screen.getByTestId('skeleton')

      expect(skeleton).toHaveClass('h-14', 'rounded-medium')
    })
  })

  it('handles all factor values correctly', async () => {
    const user = userEvent.setup()
    render(<GeneratorConfigHiresFixUpscaleFactor />)
    const select = screen.getByTestId('select-input')

    // Test each factor
    await user.selectOptions(select, '1.5')
    expect(mockOnChange).toHaveBeenLastCalledWith(1.5)

    await user.selectOptions(select, '4')
    expect(mockOnChange).toHaveBeenLastCalledWith(4)
  })
})
