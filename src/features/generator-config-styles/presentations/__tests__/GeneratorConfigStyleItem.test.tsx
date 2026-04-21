import { GeneratorConfigFormValues } from '@/features/generator-configs/types/generator-config'
import { createGeneratorConfigFormWrapper } from '@/cores/test-utils'
import { fireEvent, render, screen } from '@testing-library/react'
import { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GeneratorConfigStyleItem } from '../GeneratorConfigStyleItem'

// Mock @heroui/react components
vi.mock('@heroui/react', () => ({
  Tooltip: ({
    closeDelay,
    classNames,
    children
  }: {
    closeDelay?: number
    classNames?: Record<string, string>
    children: ReactNode
  }) => (
    <div
      data-testid="tooltip"
      data-close-delay={closeDelay}
      data-tooltip-classnames={JSON.stringify(classNames)}
    >
      {children}
    </div>
  ),
  Chip: ({
    children,
    className,
    onClick
  }: {
    children: ReactNode
    className?: string
    onClick?: () => void
  }) => (
    <button data-testid="chip" className={className} onClick={onClick}>
      {children}
    </button>
  ),
  Avatar: () => <div data-testid="avatar" />
}))

// Mock the style item data
const mockStyleItem = {
  id: 'test-style-id',
  name: 'Test Style',
  origin: 'Test Origin',
  license: 'MIT',
  positive: 'A test style description',
  image: 'test-style.jpg'
}

const createWrapper = (defaultValues?: Partial<GeneratorConfigFormValues>) =>
  createGeneratorConfigFormWrapper({ overrides: defaultValues })

describe('GeneratorConfigStyleItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders style item information', () => {
    render(<GeneratorConfigStyleItem styleItem={mockStyleItem} />, {
      wrapper: createWrapper()
    })

    expect(screen.getByText('Test Style')).toBeInTheDocument()
  })

  it('shows as not selected when style is not in the form', () => {
    render(<GeneratorConfigStyleItem styleItem={mockStyleItem} />, {
      wrapper: createWrapper()
    })

    const chip = screen.getByText('Test Style').closest('button')
    expect(chip).not.toHaveClass('border-primary')
  })

  it('shows as selected when style is in the form', () => {
    render(<GeneratorConfigStyleItem styleItem={mockStyleItem} />, {
      wrapper: createWrapper({ styles: ['test-style-id'] })
    })

    const chip = screen.getByText('Test Style').closest('button')
    expect(chip).toHaveClass('border-primary')
  })

  it('adds style to selection when clicked and not selected', () => {
    render(<GeneratorConfigStyleItem styleItem={mockStyleItem} />, {
      wrapper: createWrapper()
    })

    const chip = screen.getByTestId('chip')
    fireEvent.click(chip)

    // The chip should now have the selected styling
    expect(chip).toHaveClass('border-primary')
  })

  it('removes style from selection when clicked and already selected', () => {
    render(<GeneratorConfigStyleItem styleItem={mockStyleItem} />, {
      wrapper: createWrapper({ styles: ['test-style-id'] })
    })

    const chip = screen.getByTestId('chip')
    fireEvent.click(chip)

    // The chip should no longer have the selected styling
    expect(chip).not.toHaveClass('border-primary')
  })

  it('handles multiple styles in selection correctly', () => {
    render(<GeneratorConfigStyleItem styleItem={mockStyleItem} />, {
      wrapper: createWrapper({
        styles: ['other-style', 'test-style-id', 'another-style']
      })
    })

    const chip = screen.getByText('Test Style').closest('button')
    expect(chip).toHaveClass('border-primary')
  })

  it('renders tooltip with closeDelay={0} to close immediately', () => {
    render(<GeneratorConfigStyleItem styleItem={mockStyleItem} />, {
      wrapper: createWrapper()
    })

    const tooltip = screen.getByTestId('tooltip')
    expect(tooltip).toHaveAttribute('data-close-delay', '0')
  })

  it('renders tooltip with pointer-events-none class to allow interaction with adjacent items', () => {
    render(<GeneratorConfigStyleItem styleItem={mockStyleItem} />, {
      wrapper: createWrapper()
    })

    const tooltip = screen.getByTestId('tooltip')
    const classNamesStr = tooltip.dataset.tooltipClassnames
    const classNames = classNamesStr ? JSON.parse(classNamesStr) : {}

    expect(classNames.base).toBe('pointer-events-none')
  })
})
