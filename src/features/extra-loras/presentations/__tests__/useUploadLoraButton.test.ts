import { toast } from '@heroui/react'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useUploadLoraButton } from '../useUploadLoraButton'

type ElectronAPI = Window['electronAPI']
const mockSelectFile = vi.fn<ElectronAPI['selectFile']>()
const mockMutate = vi.hoisted(() => vi.fn())

vi.mock('@/cores/api-queries', () => ({
  useUploadLoraMutation: () => ({ mutate: mockMutate, isPending: false })
}))

vi.mock('@heroui/react', () => ({
  toast: { success: vi.fn(), danger: vi.fn(), warning: vi.fn() }
}))

const renderUpload = async () => {
  const { result } = renderHook(() => useUploadLoraButton())

  await act(async () => {
    await result.current.onUpload()
  })
}

describe('useUploadLoraButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSelectFile.mockReset()
    mockMutate.mockReset()
    globalThis.window.electronAPI.selectFile = mockSelectFile
  })

  it('uploads the selected file and confirms it', async () => {
    mockSelectFile.mockResolvedValue('/path/to/file.safetensors')
    mockMutate.mockImplementation(
      (_filePath: string, options: { onSuccess: VoidFunction }) =>
        options.onSuccess()
    )

    await renderUpload()

    expect(mockMutate).toHaveBeenCalledWith(
      '/path/to/file.safetensors',
      expect.any(Object)
    )
    expect(toast.success).toHaveBeenCalledWith('LoRA uploaded', {
      description: 'The LoRA model was uploaded successfully.'
    })
  })

  it('does nothing when no file is selected', async () => {
    mockSelectFile.mockResolvedValue(undefined)

    await renderUpload()

    expect(mockMutate).not.toHaveBeenCalled()
    expect(toast.success).not.toHaveBeenCalled()
    expect(toast.danger).not.toHaveBeenCalled()
  })

  it('leaves a failed upload to the mutation toast', async () => {
    mockSelectFile.mockResolvedValue('/path/to/file.safetensors')

    await renderUpload()

    expect(mockMutate).toHaveBeenCalled()
    expect(toast.success).not.toHaveBeenCalled()
    expect(toast.danger).not.toHaveBeenCalled()
  })

  it('shows why when the file picker fails', async () => {
    mockSelectFile.mockRejectedValue(new Error('Dialog unavailable'))

    await renderUpload()

    expect(mockMutate).not.toHaveBeenCalled()
    expect(toast.danger).toHaveBeenCalledWith('Upload failed', {
      description: 'Dialog unavailable'
    })
  })
})
