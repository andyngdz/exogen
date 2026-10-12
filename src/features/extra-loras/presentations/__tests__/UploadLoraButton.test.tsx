import { toast } from '@heroui/react'
import { useUploadLoraMutation } from '@/cores/api-queries'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UploadLoraButton } from '../UploadLoraButton'

// Mock dependencies
vi.mock('@/cores/api-queries', () => ({
  useUploadLoraMutation: vi.fn()
}))

vi.mock('@heroui/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@heroui/react')>()),
  toast: { success: vi.fn(), danger: vi.fn(), warning: vi.fn() }
}))

const mockSelectFile = vi.fn()

describe('UploadLoraButton', () => {
  const mockMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockSelectFile.mockReset()
    mockMutate.mockReset()

    const electronAPI = globalThis.window?.electronAPI
    if (!electronAPI) {
      throw new Error('window.electronAPI is not defined in test environment')
    }

    electronAPI.selectFile = mockSelectFile
    vi.mocked(useUploadLoraMutation).mockReturnValue({
      mutate: mockMutate,
      isPending: false
    } as unknown as ReturnType<typeof useUploadLoraMutation>)
  })

  it('renders upload button', () => {
    render(<UploadLoraButton />)
    expect(
      screen.getByRole('button', { name: 'Upload LoRA' })
    ).toBeInTheDocument()
    expect(screen.getByText('Upload LoRA')).toBeInTheDocument()
  })

  it('calls selectFile when button is clicked', async () => {
    mockSelectFile.mockResolvedValue('/path/to/lora.safetensors')

    render(<UploadLoraButton />)
    const button = screen.getByRole('button', { name: 'Upload LoRA' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockSelectFile).toHaveBeenCalledWith([
        {
          name: 'LoRA Models',
          extensions: ['safetensors', 'ckpt', 'pt', 'bin', 'pth']
        }
      ])
    })
  })

  it('uploads file when file is selected', async () => {
    const filePath = '/path/to/lora.safetensors'
    mockSelectFile.mockResolvedValue(filePath)

    render(<UploadLoraButton />)
    const button = screen.getByRole('button', { name: 'Upload LoRA' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(filePath, expect.any(Object))
    })
  })

  it('does not upload when file selection is cancelled', async () => {
    mockSelectFile.mockResolvedValue(null)

    render(<UploadLoraButton />)
    const button = screen.getByRole('button', { name: 'Upload LoRA' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockSelectFile).toHaveBeenCalled()
    })

    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('shows success toast on successful upload', async () => {
    mockSelectFile.mockResolvedValue('/path/to/lora.safetensors')
    mockMutate.mockImplementation(
      (_filePath: string, options: { onSuccess: VoidFunction }) =>
        options.onSuccess()
    )

    render(<UploadLoraButton />)
    const button = screen.getByRole('button', { name: 'Upload LoRA' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(vi.mocked(toast.success)).toHaveBeenCalledWith('LoRA uploaded', {
        description: 'The LoRA model was uploaded successfully.'
      })
    })
  })

  it('marks the button pending while the upload runs', () => {
    vi.mocked(useUploadLoraMutation).mockReturnValue({
      mutate: mockMutate,
      isPending: true
    } as unknown as ReturnType<typeof useUploadLoraMutation>)

    render(<UploadLoraButton />)
    const button = screen.getByRole('button', { name: 'Upload LoRA' })
    expect(button).toHaveAttribute('data-pending', 'true')
  })
})
