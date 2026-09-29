import { toast } from '@heroui/react'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useUploadLoraButton } from '../useUploadLoraButton'

type ElectronAPI = Window['electronAPI']
const mockSelectFile = vi.fn<ElectronAPI['selectFile']>()
const mockMutateAsync = vi.hoisted(() => vi.fn())

vi.mock('@/cores/api-queries', () => ({
  useUploadLoraMutation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false
  })
}))

vi.mock('@heroui/react', () => ({
  toast: { success: vi.fn(), danger: vi.fn(), warning: vi.fn() }
}))

describe('useUploadLoraButton', () => {
  let electronAPI: ElectronAPI

  beforeEach(() => {
    mockSelectFile.mockReset()
    mockMutateAsync.mockReset()
    vi.clearAllMocks()

    electronAPI = globalThis.window.electronAPI
    electronAPI.selectFile = mockSelectFile
  })

  it('uploads selected file and shows success toast', async () => {
    mockSelectFile.mockResolvedValue('/path/to/file.safetensors')
    mockMutateAsync.mockResolvedValue(undefined)

    const { result } = renderHook(() => useUploadLoraButton())

    await act(async () => {
      await result.current.onUpload()
    })

    expect(mockSelectFile).toHaveBeenCalled()
    expect(mockMutateAsync).toHaveBeenCalledWith('/path/to/file.safetensors')
    expect(vi.mocked(toast.success)).toHaveBeenCalledWith('LoRA uploaded', {
      description: 'The LoRA model was uploaded successfully.'
    })
  })

  it('does not upload when no file is selected', async () => {
    mockSelectFile.mockResolvedValue(null)

    const { result } = renderHook(() => useUploadLoraButton())

    await act(async () => {
      await result.current.onUpload()
    })

    expect(mockMutateAsync).not.toHaveBeenCalled()
    expect(vi.mocked(toast.success)).not.toHaveBeenCalled()
    expect(vi.mocked(toast.danger)).not.toHaveBeenCalled()
  })

  it('shows error toast when upload fails', async () => {
    mockSelectFile.mockResolvedValue('/path/to/file.safetensors')
    mockMutateAsync.mockRejectedValue(new Error('Upload failed'))

    const { result } = renderHook(() => useUploadLoraButton())

    await act(async () => {
      await result.current.onUpload()
    })

    expect(vi.mocked(toast.danger)).toHaveBeenCalledWith('Upload failed', {
      description: 'Upload failed'
    })
  })
})
