import { useUploadLoraMutation } from '@/cores/api-queries'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UploadLoraButton } from '../UploadLoraButton'

interface ButtonProps {
  children: ReactNode
  onPress: () => void
  isLoading: boolean
  startContent: ReactNode
  color?: string
}

// Mock dependencies
vi.mock('@/cores/api-queries', () => ({
  useUploadLoraMutation: vi.fn()
}))

const mockAddToast = vi.fn()
vi.mock('@heroui/react', () => ({
  addToast: (args: unknown) => mockAddToast(args),
  Button: ({
    children,
    onPress,
    isLoading,
    startContent,
    color
  }: ButtonProps) => (
    <button
      onClick={onPress}
      disabled={isLoading}
      data-testid="upload-button"
      data-color={color ?? 'primary'}
    >
      {startContent}
      {children}
    </button>
  )
}))

const mockSelectFile = vi.fn()

describe('UploadLoraButton', () => {
  const mockMutateAsync = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockSelectFile.mockReset()

    const electronAPI = globalThis.window?.electronAPI
    if (!electronAPI) {
      throw new Error('window.electronAPI is not defined in test environment')
    }

    electronAPI.selectFile = mockSelectFile
    vi.mocked(useUploadLoraMutation).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    } as unknown as ReturnType<typeof useUploadLoraMutation>)
  })

  it('renders upload button', () => {
    render(<UploadLoraButton />)
    expect(screen.getByTestId('upload-button')).toBeInTheDocument()
    expect(screen.getByText('Upload LoRA')).toBeInTheDocument()
  })

  it('calls selectFile when button is clicked', async () => {
    mockSelectFile.mockResolvedValue('/path/to/lora.safetensors')
    mockMutateAsync.mockResolvedValue({})

    render(<UploadLoraButton />)
    const button = screen.getByTestId('upload-button')
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
    mockMutateAsync.mockResolvedValue({})

    render(<UploadLoraButton />)
    const button = screen.getByTestId('upload-button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(filePath)
    })
  })

  it('does not upload when file selection is cancelled', async () => {
    mockSelectFile.mockResolvedValue(null)

    render(<UploadLoraButton />)
    const button = screen.getByTestId('upload-button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockSelectFile).toHaveBeenCalled()
    })

    expect(mockMutateAsync).not.toHaveBeenCalled()
  })

  it('shows success toast on successful upload', async () => {
    mockSelectFile.mockResolvedValue('/path/to/lora.safetensors')
    mockMutateAsync.mockResolvedValue({})

    render(<UploadLoraButton />)
    const button = screen.getByTestId('upload-button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith({
        title: 'LoRA uploaded',
        description: 'The LoRA model was uploaded successfully.',
        color: 'success'
      })
    })
  })

  it('shows error toast on upload failure with error message', async () => {
    const errorMessage = 'Network error'
    mockSelectFile.mockResolvedValue('/path/to/lora.safetensors')
    mockMutateAsync.mockRejectedValue(new Error(errorMessage))

    render(<UploadLoraButton />)
    const button = screen.getByTestId('upload-button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith({
        title: 'Upload failed',
        description: errorMessage,
        color: 'danger'
      })
    })
  })

  it('shows generic error toast on upload failure without error message', async () => {
    mockSelectFile.mockResolvedValue('/path/to/lora.safetensors')
    mockMutateAsync.mockRejectedValue('Unknown error')

    render(<UploadLoraButton />)
    const button = screen.getByTestId('upload-button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith({
        title: 'Upload failed',
        description: 'Failed to upload LoRA model.',
        color: 'danger'
      })
    })
  })

  it('disables button when upload is pending', () => {
    vi.mocked(useUploadLoraMutation).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true
    } as unknown as ReturnType<typeof useUploadLoraMutation>)

    render(<UploadLoraButton />)
    const button = screen.getByTestId('upload-button')
    expect(button).toBeDisabled()
  })
})
