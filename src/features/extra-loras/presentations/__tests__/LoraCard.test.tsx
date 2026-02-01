import type { LoRA } from '@/types'
import { createFormProviderWrapper } from '@/cores/test-utils'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoraCard } from '../LoraCard'

const mockLora: LoRA = {
  id: 1,
  name: 'Test LoRA',
  file_path: '/fake/path/to/lora.safetensors',
  file_size: 1024 * 512,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z'
}

const Wrapper = createFormProviderWrapper({
  formOptions: {
    defaultValues: {
      loras: [{ lora_id: 1, weight: 0 }]
    }
  }
})

describe('LoraCard', () => {
  it('renders with weight 0 and does not reset', () => {
    render(
      <Wrapper>
        <LoraCard lora={mockLora} onRemove={() => {}} />
      </Wrapper>
    )
    const thumbInput = screen.getByRole('slider')
    expect(thumbInput).toHaveAttribute('value', '0')
    fireEvent.change(thumbInput, { target: { value: 0 } })
    expect(thumbInput).toHaveAttribute('value', '0')
  })

  it('updates weight when slider changed', () => {
    render(
      <Wrapper>
        <LoraCard lora={mockLora} onRemove={() => {}} />
      </Wrapper>
    )
    const thumbInput = screen.getByRole('slider')
    fireEvent.change(thumbInput, { target: { value: 0.5 } })
    expect(thumbInput).toHaveAttribute('value', '0.5')
  })
})
