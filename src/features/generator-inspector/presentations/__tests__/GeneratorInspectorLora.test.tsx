import { useLorasQuery } from '@/cores/api-queries'
import { createGeneratorConfigFormWrapper } from '@/cores/test-utils'
import type { LoRA } from '@/types'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GeneratorInspectorLora } from '../GeneratorInspectorLora'

vi.mock('@/cores/api-queries', () => ({
  useLorasQuery: vi.fn()
}))
vi.mock('@/features/extra-loras/presentations/UploadLoraButton', () => ({
  UploadLoraButton: () => <button>Upload LoRA</button>
}))

const detailLora: LoRA = {
  id: 7,
  name: 'Detail Tweaker',
  file_path: '/loras/detail.safetensors',
  file_size: 1024,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z'
}

describe('GeneratorInspectorLora', () => {
  beforeEach(() => {
    vi.mocked(useLorasQuery).mockReturnValue({
      data: [detailLora]
    } as unknown as ReturnType<typeof useLorasQuery>)
  })

  it('moves a LoRA from the library into Active and back', async () => {
    const user = userEvent.setup()
    render(<GeneratorInspectorLora />, {
      wrapper: createGeneratorConfigFormWrapper()
    })

    expect(
      screen.getByText('Add a LoRA from the library below.')
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Detail Tweaker/ }))

    expect(
      screen.getByRole('button', { name: 'Remove Detail Tweaker' })
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Remove Detail Tweaker' })
    )

    expect(
      screen.getByText('Add a LoRA from the library below.')
    ).toBeInTheDocument()
  })
})
