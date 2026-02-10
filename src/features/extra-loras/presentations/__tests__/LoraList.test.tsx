import { useLorasQuery } from '@/cores/api-queries'
import { createFormProviderWrapper } from '@/cores/test-utils'
import type { LoRA } from '@/types'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoraList } from '../LoraList'

// Mock dependencies
vi.mock('@/cores/api-queries', () => ({
  useLorasQuery: vi.fn()
}))

vi.mock('../LoraListItem', () => ({
  LoraListItem: vi.fn(({ lora }) => (
    <div data-testid={`lora-item-${lora.id}`}>{lora.name}</div>
  ))
}))

vi.mock('../UploadLoraButton', () => ({
  UploadLoraButton: vi.fn(() => (
    <button data-testid="upload-button">Upload LoRA</button>
  ))
}))

const mockLoras: LoRA[] = [
  {
    id: 1,
    name: 'Test LoRA 1',
    file_path: '/fake/path/lora1.safetensors',
    file_size: 1024 * 512,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Test LoRA 2',
    file_path: '/fake/path/lora2.safetensors',
    file_size: 1024 * 1024,
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z'
  }
]

const Wrapper = createFormProviderWrapper({
  formOptions: {
    defaultValues: {
      loras: []
    }
  }
})

describe('LoraList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders empty state when no data is available', () => {
    vi.mocked(useLorasQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    } as unknown as ReturnType<typeof useLorasQuery>)

    render(
      <Wrapper>
        <LoraList />
      </Wrapper>
    )

    expect(screen.getByText(/No LoRAs available/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Upload a LoRA file to get started/i)
    ).toBeInTheDocument()
  })

  it('renders list of LoRAs when data is available', () => {
    vi.mocked(useLorasQuery).mockReturnValue({
      data: mockLoras,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    } as unknown as ReturnType<typeof useLorasQuery>)

    render(
      <Wrapper>
        <LoraList />
      </Wrapper>
    )

    expect(screen.getByTestId('lora-item-1')).toBeInTheDocument()
    expect(screen.getByTestId('lora-item-2')).toBeInTheDocument()
    expect(screen.getByTestId('upload-button')).toBeInTheDocument()
  })

  it('renders upload button when data is available', () => {
    vi.mocked(useLorasQuery).mockReturnValue({
      data: mockLoras,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    } as unknown as ReturnType<typeof useLorasQuery>)

    render(
      <Wrapper>
        <LoraList />
      </Wrapper>
    )

    expect(screen.getByTestId('upload-button')).toBeInTheDocument()
  })
})
