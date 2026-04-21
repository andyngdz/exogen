import type { LoRA } from '@/types'
import { fireEvent, render, screen } from '@testing-library/react'
import type { MouseEvent, ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { LoraListItem } from '../LoraListItem'

interface CardProps {
  children: ReactNode
  onPress: () => void
  className: string
  isPressable?: boolean
  isHoverable?: boolean
  tabIndex: number
  shadow?: string
}

interface CardBodyProps {
  children: ReactNode
  className: string
}

interface SwitchProps {
  isSelected: boolean
  onValueChange: (checked: boolean) => void
  'aria-label': string
  size?: string
  color?: string
}

// Mock HeroUI components
vi.mock('@heroui/react', () => ({
  Card: ({
    children,
    onPress,
    className,
    tabIndex,
    isPressable,
    isHoverable,
    shadow
  }: CardProps) => (
    <button
      type="button"
      data-testid="card"
      className={className}
      onClick={onPress}
      tabIndex={tabIndex}
      data-pressable={String(Boolean(isPressable))}
      data-hoverable={String(Boolean(isHoverable))}
      data-shadow={shadow ?? 'none'}
    >
      {children}
    </button>
  ),
  CardBody: ({ children, className }: CardBodyProps) => (
    <div data-testid="card-body" className={className}>
      {children}
    </div>
  ),
  Switch: ({
    isSelected,
    onValueChange,
    'aria-label': ariaLabel,
    size,
    color
  }: SwitchProps) => (
    <input
      type="checkbox"
      checked={isSelected}
      onClick={(event: MouseEvent<HTMLInputElement>) => {
        event.stopPropagation()
        onValueChange(!isSelected)
      }}
      readOnly
      aria-label={ariaLabel}
      data-size={size ?? 'md'}
      data-color={color ?? 'default'}
      data-testid="switch"
    />
  )
}))

const mockLora: LoRA = {
  id: 1,
  name: 'Test LoRA',
  file_path: '/fake/path/to/lora.safetensors',
  file_size: 1024 * 512, // 512 KB
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z'
}

describe('LoraListItem', () => {
  it('renders lora name and file size', () => {
    const onSelect = vi.fn()
    render(
      <LoraListItem lora={mockLora} isSelected={false} onSelect={onSelect} />
    )

    expect(screen.getByText('Test LoRA')).toBeInTheDocument()
    expect(screen.getByText('512 KB')).toBeInTheDocument()
  })

  it('formats file size in MB when >= 1MB', () => {
    const largeLora: LoRA = {
      ...mockLora,
      file_size: 1024 * 1024 * 2.5 // 2.5 MB rounds to 3 MB
    }
    const onSelect = vi.fn()
    render(
      <LoraListItem lora={largeLora} isSelected={false} onSelect={onSelect} />
    )

    expect(screen.getByText('3 MB')).toBeInTheDocument()
  })

  it('formats file size in KB when < 1MB', () => {
    const smallLora: LoRA = {
      ...mockLora,
      file_size: 1024 * 750 // 750 KB
    }
    const onSelect = vi.fn()
    render(
      <LoraListItem lora={smallLora} isSelected={false} onSelect={onSelect} />
    )

    expect(screen.getByText('750 KB')).toBeInTheDocument()
  })

  it('calls onSelect when card is clicked', () => {
    const onSelect = vi.fn()
    render(
      <LoraListItem lora={mockLora} isSelected={false} onSelect={onSelect} />
    )

    const card = screen.getByTestId('card')
    fireEvent.click(card)

    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('calls onSelect when switch is toggled', () => {
    const onSelect = vi.fn()
    render(
      <LoraListItem lora={mockLora} isSelected={false} onSelect={onSelect} />
    )

    const switchElement = screen.getByTestId('switch')
    fireEvent.click(switchElement)

    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('applies selected styles when isSelected is true', () => {
    const onSelect = vi.fn()
    render(
      <LoraListItem lora={mockLora} isSelected={true} onSelect={onSelect} />
    )

    const card = screen.getByTestId('card')
    expect(card.className).toContain('bg-default')
  })

  it('does not apply selected styles when isSelected is false', () => {
    const onSelect = vi.fn()
    render(
      <LoraListItem lora={mockLora} isSelected={false} onSelect={onSelect} />
    )

    const card = screen.getByTestId('card')
    expect(card.className).not.toContain('bg-default')
  })

  it('renders switch with correct isSelected state', () => {
    const onSelect = vi.fn()
    render(
      <LoraListItem lora={mockLora} isSelected={true} onSelect={onSelect} />
    )

    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toBeChecked()
  })

  it('renders switch aria-label with lora name', () => {
    const onSelect = vi.fn()
    render(
      <LoraListItem lora={mockLora} isSelected={false} onSelect={onSelect} />
    )

    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toHaveAttribute('aria-label', 'Toggle Test LoRA')
  })
})
