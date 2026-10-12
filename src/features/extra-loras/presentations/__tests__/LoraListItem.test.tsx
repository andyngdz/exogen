import type { LoRA } from '@/types'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LoraListItem } from '../LoraListItem'

const getCard = () => screen.getByRole('button', { name: /Test LoRA/ })

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

  it('calls onSelect when card is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <LoraListItem lora={mockLora} isSelected={false} onSelect={onSelect} />
    )

    await user.click(getCard())

    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('calls onSelect once when switch is toggled', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <LoraListItem lora={mockLora} isSelected={false} onSelect={onSelect} />
    )

    await user.click(screen.getByLabelText('Toggle Test LoRA'))

    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('applies selected styles when isSelected is true', () => {
    const onSelect = vi.fn()
    render(
      <LoraListItem lora={mockLora} isSelected={true} onSelect={onSelect} />
    )

    const card = getCard()
    expect(card.className).toContain('bg-default')
  })

  it('does not apply selected styles when isSelected is false', () => {
    const onSelect = vi.fn()
    render(
      <LoraListItem lora={mockLora} isSelected={false} onSelect={onSelect} />
    )

    const card = getCard()
    expect(card.className).not.toContain('bg-default')
  })

  it('renders switch with correct isSelected state', () => {
    const onSelect = vi.fn()
    render(
      <LoraListItem lora={mockLora} isSelected={true} onSelect={onSelect} />
    )

    expect(screen.getByLabelText('Toggle Test LoRA')).toBeChecked()
  })

  it('renders an unchecked switch labelled with the lora name', () => {
    const onSelect = vi.fn()
    render(
      <LoraListItem lora={mockLora} isSelected={false} onSelect={onSelect} />
    )

    expect(screen.getByLabelText('Toggle Test LoRA')).not.toBeChecked()
  })
})
