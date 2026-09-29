import { useImage2ImageConfigStore } from '@/features/generators'
import { createGeneratorConfigFormWrapper } from '@/cores/test-utils'
import { createFileListLike } from '@/cores/test-utils'
import { toast } from '@heroui/react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ImageInput } from '../ImageInput'

vi.mock('@heroui/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@heroui/react')>()),
  toast: { success: vi.fn(), danger: vi.fn(), warning: vi.fn() }
}))

const FormWrapper = createGeneratorConfigFormWrapper()

describe('ImageInput', () => {
  afterEach(() => {
    useImage2ImageConfigStore.getState().reset()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders preview and removes image', () => {
    useImage2ImageConfigStore
      .getState()
      .setInitImageBase64('data:image/png;base64,preview')

    render(<ImageInput />, { wrapper: FormWrapper })

    expect(screen.getByAltText('Input')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Remove input image'))

    expect(useImage2ImageConfigStore.getState().initImageBase64).toBeUndefined()
  })

  it('sets image base64 on file upload', () => {
    vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(
      function (this: FileReader) {
        Object.defineProperty(this, 'result', {
          value: 'data:image/png;base64,abc',
          configurable: true
        })
        this.dispatchEvent(new ProgressEvent('load'))
      }
    )

    render(<ImageInput />, { wrapper: FormWrapper })

    const file = new File(['x'], 'test.png', { type: 'image/png' })
    const fileList = createFileListLike([file])
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement

    Object.defineProperty(input, 'files', { value: fileList })

    fireEvent.change(input)

    return waitFor(() => {
      expect(useImage2ImageConfigStore.getState().initImageBase64).toBe(
        'data:image/png;base64,abc'
      )
    })
  })

  it('shows error when non-image is selected', () => {
    render(<ImageInput />, { wrapper: FormWrapper })

    const file = new File(['x'], 'test.txt', { type: 'text/plain' })
    const fileList = createFileListLike([file])
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement

    Object.defineProperty(input, 'files', { value: fileList })

    fireEvent.change(input)

    expect(vi.mocked(toast.danger)).toHaveBeenCalled()
  })

  it('opens file picker when clicked', async () => {
    render(<ImageInput />, { wrapper: FormWrapper })

    const file = new File(['x'], 'test.txt', { type: 'text/plain' })
    const fileList = createFileListLike([file])
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement

    Object.defineProperty(input, 'files', { value: fileList })

    fireEvent.change(input)

    expect(vi.mocked(toast.danger)).toHaveBeenCalled()

    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(() => undefined)

    fireEvent.click(
      screen.getByRole('button', { name: /^(Upload|Change) input image$/ })
    )

    expect(clickSpy).toHaveBeenCalled()
  })

  it('does not open file picker when loading', () => {
    vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(
      function () {
        // Intentionally never calls onload/onerror to keep loading state true.
      }
    )

    render(<ImageInput />, { wrapper: FormWrapper })

    const file = new File(['x'], 'test.png', { type: 'image/png' })
    const fileList = createFileListLike([file])
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement

    Object.defineProperty(input, 'files', { value: fileList })

    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(() => undefined)

    fireEvent.change(input)

    fireEvent.click(
      screen.getByRole('button', { name: /^(Upload|Change) input image$/ })
    )

    expect(clickSpy).not.toHaveBeenCalled()
  })
})
